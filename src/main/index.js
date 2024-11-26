import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import axios from 'axios'
import * as path from 'node:path'
import * as fs from 'node:fs'
import * as os from 'node:os'

import 'dotenv/config'
import moment from 'moment'
import { FilterDepart } from '../renderer/src/functions/Stripe/FilterDepart'
import { Login } from '../renderer/src/functions/Core/Login'

const { exec } = require('child_process')

const configFilePath = path.join(app.getPath('userData'), 'config.json')

function createWindow() {
  const mainWindow = new BrowserWindow({
    show: false,
    autoHideMenuBar: true,
    nodeIntegration: true,
    contextIsolation: false,
    ...(process.platform === 'win32' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.setFullScreen(false)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  let zplTemplate = ''

  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.whenReady().then(() => {
    async function fetchZPLTemplate(templateType) {
      try {
        let data = new FormData()
        data.append('ip', '172.20.70.62')

        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://ws02.mercatus.com.br/v1/getConfiguracao',
          headers: {
            Authorization:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ3czAyLm1lcmNhdHVzLmNvbS5iciIsIm5hbWUiOiJNaWNoZWwgU29hcmVzIFBpbnRvciIsImlhdCI6MTcwODAyNTg5N30.6kQmcJTnTD_G6L-0gfwUQGBBhDMQjA19KnG8mE4rfbQ'
          },
          data: data
        }

        const response = await axios.request(config)

        zplTemplate = response.data.etiqueta.find((e) => e.tipo === templateType).etiqueta
      } catch (error) {
        console.log('Error fetching template:', error)
      }
    }

    function readConfig() {
      try {
        if (fs.existsSync(configFilePath)) {
          const configData = fs.readFileSync(configFilePath, 'utf8')
          return JSON.parse(configData)
        }
      } catch (error) {
        console.error('Erro ao ler o arquivo de configuração:', error)
      }
      return {}
    }

    function writeConfig(config) {
      try {
        fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), 'utf8')
      } catch (error) {
        console.error('Erro ao escrever no arquivo de configuração:', error)
      }
    }

    ipcMain.handle(
      'listStripeProducts',
      async (
        event,
        {
          tarjaEan,
          tarjaDescription,
          tarjaMark,
          tarjaDepartment,
          tarjaSection,
          tarjaGroup,
          tarjaSubGroup,
          currentPage,
          storeSelected
        }
      ) => {
        function fixEncoding(rawData) {
          let buffer = Buffer.from(rawData, 'binary')
          return buffer.toString('utf-8')
        }

        let fixedEncodingData = fixEncoding(tarjaEan)
        let cleanedData = fixedEncodingData.match(/\d+/)?.[0] || ''

        try {
          const response = await axios.request({
            method: 'post',
            url: 'https://tarja.mercatus.com.br/tarja',
            headers: {
              Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MzEwNjk4MDEsInVpZCI6MTIzNDU2Nzg5MTB9.3C6wlt6Afqg7nVB_E-ZtiOvcs6pJDDcPlmvTR-OrZp4`,
              'Content-Type': 'application/json'
            },
            data: JSON.stringify({
              barra_key: cleanedData,
              descricao: tarjaDescription,
              marca: tarjaMark,
              departamento: tarjaDepartment,
              secao: tarjaSection,
              grupo: tarjaGroup,
              subgrupo: tarjaSubGroup,
              currentPage: currentPage,
              codLoja: storeSelected
            })
          })

          if (response.data.length === 0) {
            return {
              error: 'Atenção! Produto não foi localizado ou não faz parte das opções do filtro.'
            }
          }

          return response.data
        } catch (error) {
          return error
        }
      }
    )

    ipcMain.handle(
      'listMarkdownProducts',
      async (
        event,
        { departament: departament, section: section, storeSelected: storeSelected }
      ) => {
        const data = JSON.stringify({
          loja_key: storeSelected,
          departamento: departament,
          secao: section,
          limit: 100
        })

        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://tarja.mercatus.com.br/remarcacao',
          headers: {
            Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MzEwNjk4MDEsInVpZCI6MTIzNDU2Nzg5MTB9.3C6wlt6Afqg7nVB_E-ZtiOvcs6pJDDcPlmvTR-OrZp4`,
            'Content-Type': 'application/json'
          },
          data: data
        }

        const response = await axios.request(config)
        return response.data
      }
    )

    ipcMain.on('login', async (event, { document, password }) => {
      return new Login(
        event,
        document,
        password,
        'mercatus_checklist',
        'mobile',
        'https://ws04.mercatus.com.br/v1/auth/login'
      ).login()
    })

    ipcMain.handle('filter-department', async () => {
      return new FilterDepart('departamento', '').recoveryFilter()
    })

    ipcMain.handle('filter-list', async () => {
      let config = readConfig()
      try {
        const response = await axios.request({
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://tarja.mercatus.com.br/lista',
          headers: {
            Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MzEwNjk4MDEsInVpZCI6MTIzNDU2Nzg5MTB9.3C6wlt6Afqg7nVB_E-ZtiOvcs6pJDDcPlmvTR-OrZp4`
          },
          data: JSON.stringify({
            codLoja: config.storeSelected
          })
        })

        return response.data.map((list) => ({
          label: list.nome,
          value: list.id
        }))
      } catch (error) {
        console.error('Erro ao buscar departamentos:', error)
        throw error
      }
    })

    ipcMain.handle('filter_list_items', async (e, listsSelected) => {
      try {
        const response = await axios.request({
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://tarja.mercatus.com.br/items',
          headers: {
            Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MzEwNjk4MDEsInVpZCI6MTIzNDU2Nzg5MTB9.3C6wlt6Afqg7nVB_E-ZtiOvcs6pJDDcPlmvTR-OrZp4`
          },
          data: JSON.stringify({
            idLista: listsSelected.listsSelected
          })
        })

        const listItems = []

        response.data.forEach((entry) => {
          const produtos = entry.list_item
          const tipoEtiqueta = entry.tipo_etiqueta
          const quantidade = entry.quantidade

          produtos.forEach((produto) => {
            listItems.push({
              ...produto,
              tipo_etiqueta: tipoEtiqueta,
              quantidade: quantidade
            })
          })
        })

        return listItems
      } catch (error) {
        console.error('Erro ao buscar departamentos:', error)
        throw error
      }
    })

    ipcMain.handle('filter-section', async (e, { selectedValue }) => {
      try {
        const response = await axios.request({
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://tarja.mercatus.com.br/secao',
          headers: {
            Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MzEwNjk4MDEsInVpZCI6MTIzNDU2Nzg5MTB9.3C6wlt6Afqg7nVB_E-ZtiOvcs6pJDDcPlmvTR-OrZp4`
          },
          data: JSON.stringify({
            departamento_key: selectedValue
          })
        })

        return response.data.map((section) => ({
          label: section.nome,
          value: section.secao_key
        }))
      } catch (error) {
        console.error('Erro ao buscar departamentos:', error)
        throw error
      }
    })

    ipcMain.handle('stores', async (e) => {
      try {
        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://tarja.mercatus.com.br/lojas',
          headers: {
            Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MzEwNjk4MDEsInVpZCI6MTIzNDU2Nzg5MTB9.3C6wlt6Afqg7nVB_E-ZtiOvcs6pJDDcPlmvTR-OrZp4`
          }
        }

        const response = await axios.request(config)

        return response.data.map((store) => ({
          label: store.loja_key,
          value: store.loja_key
        }))
      } catch (error) {
        console.log('Error fetching cod loja:', error)
      }
    })

    ipcMain.handle('filter-group', async (e, { selectedValue }) => {
      try {
        const response = await axios.request({
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://tarja.mercatus.com.br/grupo',
          headers: {
            Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MzEwNjk4MDEsInVpZCI6MTIzNDU2Nzg5MTB9.3C6wlt6Afqg7nVB_E-ZtiOvcs6pJDDcPlmvTR-OrZp4`
          },
          data: JSON.stringify({
            secao_key: selectedValue
          })
        })

        return response.data.map((group) => ({
          label: group.nome,
          value: group.grupo_produto_key
        }))
      } catch (error) {
        console.error('Erro ao buscar departamentos:', error)
        throw error
      }
    })

    ipcMain.handle('filter-sub-group', async (e, { selectedValue }) => {
      try {
        const response = await axios.request({
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://tarja.mercatus.com.br/subgrupo',
          headers: {
            Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MzEwNjk4MDEsInVpZCI6MTIzNDU2Nzg5MTB9.3C6wlt6Afqg7nVB_E-ZtiOvcs6pJDDcPlmvTR-OrZp4`
          },
          data: JSON.stringify({
            grupo_produto_key: selectedValue
          })
        })

        return response.data.map((subgroup) => ({
          label: subgroup.nome,
          value: subgroup.sub_grupo_produto_key
        }))
      } catch (error) {
        console.error('Erro ao buscar departamentos:', error)
        throw error
      }
    })

    ipcMain.handle('list-local-printers', async () => {
      const interfaces = os.networkInterfaces()
      let localIP = ''

      for (const iface in interfaces) {
        for (const ifaceDetails of interfaces[iface]) {
          if (ifaceDetails.family === 'IPv4' && !ifaceDetails.internal) {
            localIP = ifaceDetails.address
            break
          }
        }
        if (localIP) break
      }

      return new Promise((resolve, reject) => {
        try {
          exec('wmic printer get name', (error, stdout) => {
            if (error) {
              console.error(`exec error: ${error}`)
              reject([])
              return
            }
            const printers = stdout
              .split(/\r?\n/)
              .slice(1)
              .map((line) => line.trim())
              .filter(Boolean)
            resolve(printers)
          })
        } catch (error) {
          console.error('Erro ao listar impressoras:', error)
          reject([])
        }
      })
    })

    ipcMain.on(
      'set-selected-printer',
      (event, { selectedPrinterWithDiscount, selectedPrinterWithoutDiscount, storeSelected }) => {
        writeConfig({ selectedPrinterWithDiscount, selectedPrinterWithoutDiscount, storeSelected })
        event.reply('printer-selected-success')
      }
    )

    ipcMain.handle('get-selected-printer', () => {
      const config = readConfig()
      return {
        selectedPrinterWithDiscount: config.selectedPrinterWithDiscount || '',
        selectedPrinterWithoutDiscount: config.selectedPrinterWithoutDiscount || '',
        storeSelected: config.storeSelected || ''
      }
    })

    let templateType

    async function getTemplateType(event, product, precoFormatado, labelTypeSelect) {
      if (!Array.isArray(product)) {
        console.error('Erro: `product` não é um array.')
        return { error: 'product-not-array' }
      }

      console.log(labelTypeSelect)

      if (!product['tipo_etiqueta']) {
        switch (labelTypeSelect) {
          case 'R':
            templateType = product.some((item) => item.preco_oferta_final)
              ? precoFormatado
                ? 'zebra_etiqueta_reduzida_preco_desconto'
                : 'zebra_etiqueta_reduzida_magazine_preco_desconto'
              : precoFormatado
                ? 'zebra_etiqueta_reduzida_preco_normal'
                : 'zebra_etiqueta_reduzida_magazine_preco_normal'
            break
          case 'N':
            templateType = product.some((item) => item.preco_oferta_final)
              ? precoFormatado
                ? 'zebra_etiqueta_normal_preco_desconto'
                : 'zebra_etiqueta_magazine_preco_desconto'
              : precoFormatado
                ? 'zebra_etiqueta_normal_preco_normal'
                : 'zebra_etiqueta_magazine_preco_normal'
            break
          case 'SM':
            templateType = 'zebra_etiqueta_moda_normal'
            break
          case 'M':
            templateType = 'zebra_etiqueta_moda_normal'
            break
          case 'F':
            if (product.some((item) => item.fardo) === false) {
              event.reply('print-error-fardo')
              return
            }

            templateType = 'etiqueta_fardo_normal'

            break
          default:
            console.error('Tipo de etiqueta não reconhecido')
        }
      }

      if (product['tipo_etiqueta']) {
        switch (product['tipo_etiqueta']) {
          case 'R':
            templateType = product.some((item) => item.preco_oferta_final)
              ? precoFormatado
                ? 'zebra_etiqueta_reduzida_preco_desconto'
                : 'zebra_etiqueta_reduzida_magazine_preco_desconto'
              : precoFormatado
                ? 'zebra_etiqueta_reduzida_preco_normal'
                : 'zebra_etiqueta_reduzida_magazine_preco_normal'
            break
          case 'N':
            templateType = product.some((item) => item.preco_oferta_final)
              ? precoFormatado
                ? 'zebra_etiqueta_normal_preco_desconto'
                : 'zebra_etiqueta_magazine_preco_desconto'
              : precoFormatado
                ? 'zebra_etiqueta_normal_preco_normal'
                : 'zebra_etiqueta_magazine_preco_normal'
            break
          case 'F':
            if (product.some((item) => item.fardo) === false) {
              event.reply('print-error-fardo')
              return
            }

            templateType = 'etiqueta_fardo_normal'
            break
          default:
            console.error('Tipo de etiqueta não reconhecido')
        }
      }

      return { templateType }
    }

    async function printProducts(event, products, labelTypeSelect) {
      const productsWithDiscount = products.filter((product) => product.preco_oferta_final)
      const productsWithoutDiscount = products.filter((product) => !product.preco_oferta_final)

      const config = readConfig()
      const selectedPrinterWithDiscount = config.selectedPrinterWithDiscount || ''
      const selectedPrinterWithoutDiscount = config.selectedPrinterWithoutDiscount || ''

      let printErrors = false

      async function processPrint(productItem) {
        const quantity = productItem.quantity || 1
        for (let i = 0; i < quantity; i++) {
          const precoPorQuantidadeDaUnidadeDeMedida =
            productItem.preco != null &&
            productItem.quantidade_embalagem_venda != null &&
            productItem.quantidade_unidade_medida != null
              ? (productItem.preco / productItem.quantidade_embalagem_venda) *
                productItem.quantidade_unidade_medida
              : ''

          const precoFormatado =
            precoPorQuantidadeDaUnidadeDeMedida !== '' &&
            !isNaN(precoPorQuantidadeDaUnidadeDeMedida) &&
            isFinite(precoPorQuantidadeDaUnidadeDeMedida)
              ? precoPorQuantidadeDaUnidadeDeMedida.toFixed(2).replace('.', ',')
              : ''

          const { templateType } = await getTemplateType(
            event,
            [productItem],
            precoFormatado,
            labelTypeSelect
          )

          await fetchZPLTemplate(templateType, zplTemplate)

          const fardo = JSON.parse(productItem.fardo)
          const fardoQtde = Array.isArray(fardo) && fardo.length > 0 ? fardo[0].qtde : ''
          const precoEmVigorFardo =
            Array.isArray(fardo) && fardo.length > 0
              ? (productItem.preco * fardo[0].qtde).toFixed(2).replace('.', ',')
              : undefined

          const zplCommand = zplTemplate
            .replace(/{descricaoTamanho}/g, productItem.descricao.length > 20 ? 30 : 40 || '')
            .replace(/{descricao}/g, productItem.descricao || '')
            .replace(/{codEan}/g, productItem.barra_key || '')
            .replace(/{curvaAbc}/g, productItem.curva || '')
            .replace(/{embalagemKey}/g, productItem.embalagem_key || '')
            .replace(
              /{precoEmVigor}/g,
              (parseFloat(productItem.preco) || 0).toFixed(2).replace('.', ',') || ''
            )
            .replace(/{precoLargura}/g, productItem.preco >= 1000.0 ? 110 : 100 || '')
            .replace(/{tipo_unidade_medida}/g, productItem.tipo_unidade_medida || '')
            .replace(/{precoPorQuantidadeDaUnidadeDeMedida}/g, precoFormatado ? precoFormatado : '')
            .replace(
              /{dataFinalOferta}/g,
              moment(productItem.preco_oferta_final, 'YYYY-MM-DD', true).isValid()
                ? moment(productItem.preco_oferta_final).format('DD/MM/YYYY')
                : productItem.preco_oferta_final
            )
            .replace(/{fardoQtde}/g, fardoQtde)
            .replace(/{precoEmVigorFardo}/g, precoEmVigorFardo)

          const tempFilePath = path.join(app.getPath('userData'), `temp_zpl_file_${Date.now()}.zpl`)

          fs.writeFileSync(tempFilePath, zplCommand, 'utf8')

          const printer = productItem.preco_oferta_final
            ? selectedPrinterWithoutDiscount
            : selectedPrinterWithDiscount

          console.log(zplCommand)

          const printCommand = `COPY "${tempFilePath}" \\\\${process.env.COMPUTERNAME}\\${printer}`

          exec(printCommand, (err, stdout, stderr) => {
            if (err) {
              console.error(`Erro ao imprimir: ${err.message}`)
              event.reply('print-error', `Erro ao imprimir: ${err.message}`)
              printErrors = true
              return
            }

            if (stderr) {
              console.error(`Erro no comando de impressão: ${stderr}`)
              event.reply('print-error', `Erro no comando de impressão: ${stderr}`)
              printErrors = true
              return
            }

            if (stdout) {
              event.reply('printTarjaCompleted')
            }

            fs.unlink(tempFilePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error(`Erro ao remover arquivo temporário: ${unlinkErr.message}`)
              }
            })
          })
        }
      }

      for (const product of productsWithDiscount) {
        await processPrint(product)
      }

      for (const product of productsWithoutDiscount) {
        await processPrint(product)
      }
    }

    ipcMain.on('printTarja', async (event, { product, labelTypeSelect }) => {
      if (!Array.isArray(product) || product.length === 0) {
        console.error('Esperado um array de produtos não vazio, mas recebeu:', product)
        event.reply('print-error', 'Nenhum produto para imprimir.')
        return
      }

      try {
        await printProducts(event, product, labelTypeSelect)
      } catch (error) {
        console.error('Erro ao imprimir:', error.message)
        event.reply('print-error', `Erro ao imprimir: ${error.message}`)
      }
    })

    const generateZPLByOfferAndDepartment = (products) => {
      const groupedData = products.reduce((result, productItem) => {
        const { oferta, departamento } = productItem

        if (!result[oferta]) {
          result[oferta] = {}
        }
        if (!result[oferta][departamento]) {
          result[oferta][departamento] = []
        }

        result[oferta][departamento].push(productItem)

        return result
      }, {})

      return groupedData
    }

    const sendToPrinter = (printerName, zplData) => {
      return new Promise((resolve) => {
        const tempFilePath = path.join(app.getPath('userData'), `temp_zpl_file_${Date.now()}.zpl`)

        console.log(printerName, zplData)

        fs.writeFile(tempFilePath, zplData, (err) => {
          if (err) {
            console.error(`Erro ao escrever no arquivo: ${err}`)
            return
          }
          console.log(`Arquivo criado em: ${tempFilePath}`)

          fs.readFile(tempFilePath, 'utf8', (err, data) => {
            if (err) {
              console.error(`Erro ao ler o arquivo: ${err}`)
              return
            }

            console.log(`Conteúdo do arquivo ${tempFilePath}:\n${data}`)
          })
        })

        const printCommand = `COPY "${tempFilePath}" \\\\${process.env.COMPUTERNAME}\\${printerName}`

        exec(printCommand, (err, stdout, stderr) => {
          if (err) {
            console.error(`Erro ao imprimir: ${err.message}`)
            return
          }

          if (stderr) {
            console.error(`Erro no comando de impressão: ${stderr}`)
          }

          resolve(stdout)
        })
      })
    }

    const generateZPLForProduct = async (items, isDiscounted) => {
      let fullZpl = ''
      for (const productItem of items) {
        const precoPorQuantidadeDaUnidadeDeMedida =
          productItem.preco != null &&
          productItem.quantidade_embalagem_venda != null &&
          productItem.quantidade_unidade_medida != null
            ? (productItem.preco / productItem.quantidade_embalagem_venda) *
              productItem.quantidade_unidade_medida
            : ''

        const precoFormatado =
          precoPorQuantidadeDaUnidadeDeMedida !== '' &&
          !isNaN(precoPorQuantidadeDaUnidadeDeMedida) &&
          isFinite(precoPorQuantidadeDaUnidadeDeMedida)
            ? precoPorQuantidadeDaUnidadeDeMedida.toFixed(2).replace('.', ',')
            : ''

        let templateType = isDiscounted
          ? precoFormatado
            ? 'zebra_etiqueta_normal_preco_desconto'
            : 'zebra_etiqueta_magazine_preco_desconto'
          : precoFormatado
            ? 'zebra_etiqueta_normal_preco_normal'
            : 'zebra_etiqueta_magazine_preco_normal'

        await fetchZPLTemplate(templateType, zplTemplate)

        if (!zplTemplate) {
          throw new Error(`Template ZPL não encontrado para o tipo: ${templateType}`)
        }

        const zplCommand = zplTemplate
          .replace(/{descricaoTamanho}/g, productItem.descricao?.length > 20 ? 30 : 40)
          .replace(/{descricao}/g, productItem.descricao || '')
          .replace(/{codEan}/g, productItem.barra_key || '')
          .replace(/{curvaAbc}/g, productItem.curva || '')
          .replace(/{embalagemKey}/g, productItem.embalagem_key || '')
          .replace(
            /{precoEmVigor}/g,
            (parseFloat(productItem.preco) || 0).toFixed(2).replace('.', ',') || ''
          )
          .replace(/{precoLargura}/g, productItem.preco >= 1000.0 ? 110 : 100)
          .replace(/{tipo_unidade_medida}/g, productItem.tipo_unidade_medida || '')
          .replace(/{precoPorQuantidadeDaUnidadeDeMedida}/g, precoFormatado || '')
          .replace(
            /{dataFinalOferta}/g,
            moment(productItem.preco_oferta_final, 'YYYY-MM-DD', true).isValid()
              ? moment(productItem.preco_oferta_final).format('DD/MM/YYYY')
              : productItem.preco_oferta_final || ''
          )

        fullZpl += zplCommand
      }
      return fullZpl
    }

    ipcMain.on('printMarkdown', async (event, { product }) => {
      if (!Array.isArray(product) || product.length === 0) {
        console.error('Esperado um array de produtos não vazio, mas recebeu:', product)
        event.reply('print-error', 'Nenhum produto para imprimir.')
        return
      }

      const config = readConfig()
      const selectedPrinterWithDiscount = config.selectedPrinterWithDiscount || ''
      const selectedPrinterWithoutDiscount = config.selectedPrinterWithoutDiscount || ''

      if (!selectedPrinterWithDiscount && !selectedPrinterWithoutDiscount) {
        console.error('Nenhuma impressora configurada.')
        event.reply('print-error', 'Nenhuma impressora configurada.')
        return
      }

      const groupedProducts = generateZPLByOfferAndDepartment(product)

      try {
        if (groupedProducts[false]) {
          for (const [department, items] of Object.entries(groupedProducts[false])) {
            let fullZpl = `^XA^CF0,130^FO100,100^FD${department}^FS^XZ\n`
            fullZpl += await generateZPLForProduct(items, false)
            await sendToPrinter(selectedPrinterWithDiscount, fullZpl)
          }
        }

        if (groupedProducts[true]) {
          for (const [department, items] of Object.entries(groupedProducts[true])) {
            let fullZpl = `^XA^CF0,130^FO100,100^FD${department}^FS^XZ\n`
            fullZpl += await generateZPLForProduct(items, true)
            await sendToPrinter(selectedPrinterWithoutDiscount, fullZpl)
          }
        }

        event.reply('print-success', 'Impressão concluída com sucesso.')
      } catch (error) {
        console.error('Erro durante o processo de impressão:', error.message)
        event.reply('print-error', 'Erro durante o processo de impressão.')
      }
    })
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
