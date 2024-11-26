import '../src/styles/global.css'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Flowbite } from 'flowbite-react'
import { Footer } from './components/Footer'
import { Navigation } from './components/Navigation'
import InputNumber from './components/Inputs/Number'
import { InputText } from './components/Inputs/Text'
import { Modal } from './components/Modal'
import { LoadingOverlay } from './components/Spinner'
import { PrinterSelector } from './components/ConfPrint'
import { ButtonSub } from './components/Button'
import { PasswordInput } from './components/Inputs/Password'
import {
  ArrowRightCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PrinterIcon
} from '@heroicons/react/16/solid'
import { SelectOptions } from './components/Options'
import { DataTable } from './components/Table'
import { Bounce, toast, ToastContainer } from 'react-toastify'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { Header } from './components/Header'
import EditableLabel from './components/Modal/EditableLabel'
import { FormEditableLabel } from './components/Form/FormEditableLabel'

export function App() {
  const [listStripeProducts, setListStripeProducts] = useState([])
  const [listProducts, setListProducts] = useState([])
  const [listMarkdownProducts, setListMarkdownProducts] = useState([])

  const [tarjaEan, setTarjaEan] = useState('')
  const [tarjaEanError, setTarjaEanError] = useState(false)

  const [tarjaDescription, setTarjaDescription] = useState('')
  const [tarjaDescriptionError, setTarjaDescriptionError] = useState(false)

  const [tarjaMark, setTarjaMark] = useState('')
  const [tarjaMarkError, setTarjaMarkError] = useState(false)

  const [tarjaFilteredProducts, setTarjaFilteredProducts] = useState([])
  const [tarjaSelectedProducts, setTarjaSelectedProducts] = useState([])
  const [tarjaQuantities, setTarjaQuantities] = useState({})

  const [tarjaDepartment, setTarjaDepartment] = useState('')
  const [tarjaDepartmentError, setTarjaDepartmentError] = useState(false)

  const [tarjaSection, setTarjaSection] = useState('')
  const [tarjaSectionError, setTarjaSectionError] = useState(false)

  const [tarjaGroup, setTarjaGroup] = useState('')
  const [tarjaGroupError, setTarjaGroupError] = useState(false)

  const [tarjaSubgroup, setTarjaSubgroup] = useState('')
  const [tarjaSubGroupError, setTarjaSubGroupError] = useState(false)

  const [listsSelected, setListsSelected] = useState('')
  const [listsSelectedError, setListsSelectedError] = useState(false)

  const [listStore, setListStore] = useState('')
  const [storeSelected, setStoreSelected] = useState('')
  const [listStoreError, setListStoreError] = useState(false)

  const [markdownDepartment, setMarkdownDepartment] = useState('')

  const [markdownSection, setMarkdownSection] = useState('')

  const [markdownLoginModal, setMarkdownLoginModal] = useState(false)
  const [markdownTimeError, setMarkdownTimeError] = useState('')
  const [printConfigModal, setPrintConfigModal] = useState(false)

  const [document, setDocument] = useState('')
  const [password, setPassword] = useState('')
  const [documentError, setDocumentError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [loginError, setLoginError] = useState('')

  const [printers, setPrinters] = useState([])

  const [selectedPrinterWithDiscount, setSelectedPrinterWithDiscount] = useState('')
  const [selectedPrinterWithoutDiscount, setSelectedPrinterWithoutDiscount] = useState('')
  const [printerError, setPrinterError] = useState(false)

  const [departments, setDepartments] = useState([])
  const [sections, setSections] = useState([])
  const [groups, setGroups] = useState([])
  const [subGroups, setSubGroups] = useState([])
  const [lists, setLists] = useState([])

  let [loading, setLoading] = useState(false)

  const inputRef = useRef(null)

  const PAGE_SIZE = 5

  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(listStripeProducts.length / PAGE_SIZE)

  const [showPassword, setShowPassword] = useState(false)

  const [isButtonSelectedConfigPrint, setButtonSelectedConfigPrint] = useState(false)
  const [isButtonSelectedMarkdown, setButtonSelectedMarkdown] = useState(false)

  const [hiddenMarkdownLogin, setHiddenMarkdownLogin] = useState(false)
  const [hiddenMarkdownPrint, setHiddenMarkdownPrint] = useState(false)

  const [labelTypeSelect, setLabelTypeSelect] = useState('N')

  const [errorSearchProduct, setErrorSearchProduct] = useState(false)
  const [errorTypePrint, setErrorTypePrint] = useState(false)

  const [valueSelectedPrinterWithDiscount, setValueSelectedPrinterWithDiscount] = useState('')
  const [valueSelectedPrinterWithoutDiscount, setValueSelectedPrinterWithoutDiscount] = useState('')

  const [newCurrent, setNewCurrent] = useState(currentPage)
  const [pageTarjaMark, setPageTarjaMark] = useState('')
  const [pageTarjaDescription, setPageTarjaDescription] = useState('')

  const [editableLabelModal, setEditableLabelModal] = useState(false)

  useEffect(() => {
    if (errorSearchProduct) {
      const timer = setTimeout(() => {
        setErrorSearchProduct(false)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [errorSearchProduct])

  useEffect(() => {
    if (errorTypePrint) {
      const timer = setTimeout(() => {
        setErrorTypePrint(false)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [errorTypePrint])

  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        setLoading(true)

        const printers = await window.electron.ipcRenderer.invoke('list-local-printers')
        setPrinters(printers)

        const listStore = await window.electron.ipcRenderer.invoke('stores')
        setListStore(listStore)

        const listProduct = await window.electron.ipcRenderer.invoke('get-selected-printer')
        setStoreSelected(listProduct['storeSelected'])
        setValueSelectedPrinterWithDiscount(listProduct['selectedPrinterWithDiscount'])
        setValueSelectedPrinterWithoutDiscount(listProduct['selectedPrinterWithoutDiscount'])
      } catch (error) {
        console.error('Erro ao buscar impressoras:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrinters()
  }, [])

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await window.electron.ipcRenderer.invoke('filter-department')
        setDepartments(response)

        // const responseItem = await window.electron.ipcRenderer.invoke('filter-list')
        // setLists(responseItem)
      } catch (error) {
        console.error('Erro ao buscar departamentos:', error)
        toast.error('Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.')
      }
    }

    fetchDepartments()
  }, [])

  useEffect(() => {
    setDocument('')
    setPassword('')
    setTarjaFilteredProducts('')

    focusInput()

    setHiddenMarkdownLogin(false)
    setHiddenMarkdownPrint(false)
    setMarkdownTimeError('')
    setDocument('')
    setPassword('')
    setMarkdownDepartment('')
    setMarkdownSection('')
    setListMarkdownProducts([])
    setTarjaSection('')
  }, [])

  const loadList = async () => {
    try {
      const responseItem = await window.electron.ipcRenderer.invoke('filter-list')
      setLists(responseItem)
    } catch (error) {
      console.error('Erro ao carregar listas', error)
    }
  }

  const loadStore = async () => {
    try {
      const responseItem = await window.electron.ipcRenderer.invoke('filter-list')
      setLists(responseItem)
    } catch (error) {
      console.error('Erro ao carregar listas', error)
    }
  }

  const print = (productData) => {
    setLoading(true)
    setTarjaQuantities({})
    window.electron.ipcRenderer.send('printTarja', {
      product: productData,
      labelTypeSelect: labelTypeSelect
    })

    window.electron.ipcRenderer.once('print-error', () => {
      setLoading(false)
    })

    window.electron.ipcRenderer.once('print-error-fardo', () => {
      setLoading(false)
      setErrorTypePrint(true)
    })

    window.electron.ipcRenderer.once('printTarjaCompleted', () => {
      setLoading(false)
    })
  }

  const focusInput = useCallback(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 0)
  }, [])

  function handleClearInputSearch() {
    setTarjaEan('')
    setTarjaDescription('')
    setTarjaMark('')
    setCurrentPage(1)
  }

  function handleClearInputPrint() {
    setCurrentPage(1)
    setTarjaSelectedProducts([])
    setTarjaQuantities({})
  }

  const handlePagesNext = async () => {
    if (listStripeProducts.length !== 0) {
      const updatedPage = currentPage + 1
      setCurrentPage(updatedPage)
      setLoading(true)

      const products = await window.electron.ipcRenderer.invoke('listStripeProducts', {
        tarjaEan: tarjaEan,
        tarjaDescription: pageTarjaDescription,
        tarjaMark: pageTarjaMark,
        tarjaDepartment: tarjaDepartment,
        tarjaSection: tarjaSection,
        tarjaGroup: tarjaGroup,
        tarjaSubGroup: tarjaSubgroup,
        currentPage: updatedPage,
        storeSelected: storeSelected
      })

      if (products.error) {
        // setErrorSearchProduct(true)
        setListStripeProducts([])
        setLoading(false)
        throw new Error(products.error)
      }

      setListStripeProducts(products)
      setLoading(false)
      return
    }
  }

  const handlePagesPreview = async () => {
    const updatedPage = currentPage - 1
    setCurrentPage(updatedPage)
    setLoading(true)

    const products = await window.electron.ipcRenderer.invoke('listStripeProducts', {
      tarjaEan: tarjaEan,
      tarjaDescription: pageTarjaDescription,
      tarjaMark: pageTarjaMark,
      tarjaDepartment: tarjaDepartment,
      tarjaSection: tarjaSection,
      tarjaGroup: tarjaGroup,
      tarjaSubGroup: tarjaSubgroup,
      currentPage: updatedPage,
      storeSelected: storeSelected
    })

    setListStripeProducts(products)
    setLoading(false)

    if (products.error) {
      setErrorSearchProduct(true)
      throw new Error(products.error)
    }
  }

  const validateInputs = () => {
    const hasError =
      !tarjaEan.trim() &&
      !tarjaDescription.trim() &&
      !tarjaMark.trim() &&
      listsSelected.length === 0 &&
      tarjaDepartment.length === 0 &&
      tarjaSection.length === 0 &&
      tarjaGroup.length === 0 &&
      tarjaSubgroup.length === 0

    if (hasError) {
      setTarjaEanError(true)
      setTarjaDescriptionError(true)
      setTarjaMarkError(true)
      setTarjaDepartmentError(true)
      setTarjaSectionError(true)
      setTarjaGroupError(true)
      setTarjaSubGroupError(true)
      setListsSelectedError(true)
      setPageTarjaMark('')
      setPageTarjaDescription('')
      setListStripeProducts([])
      return false
    }

    setTarjaEanError(false)
    setTarjaDescriptionError(false)
    setTarjaMarkError(false)
    setTarjaDepartmentError(false)
    setTarjaSectionError(false)
    setTarjaGroupError(false)
    setTarjaSubGroupError(false)
    setListsSelectedError(false)

    return true
  }

  const findProduct = async () => {
    setPageTarjaMark('')
    setPageTarjaDescription('')
    setCurrentPage(1)
    setListProducts([])
    setListsSelected('')

    if (storeSelected.length === 0) {
      setPrintConfigModal(true)
      setButtonSelectedConfigPrint(true)
      setListStoreError(true)
      return
    }

    if (listsSelected.length > 0) {
      setLoading(true)

      const isValid = validateInputs()

      if (!isValid) {
        return
      }

      const listItems = await window.electron.ipcRenderer.invoke('filter_list_items', {
        listsSelected
      })
      setListProducts(listItems)

      setLoading(false)
      return
    }

    setErrorSearchProduct(false)

    try {
      const isValid = validateInputs()

      if (!isValid) {
        return
      }

      handleClearInputSearch()
      setLoading(true)

      const products = await window.electron.ipcRenderer.invoke('listStripeProducts', {
        tarjaEan: tarjaEan,
        tarjaDescription: tarjaDescription,
        tarjaMark: tarjaMark,
        tarjaDepartment: tarjaDepartment,
        tarjaSection: tarjaSection,
        tarjaGroup: tarjaGroup,
        tarjaSubGroup: tarjaSubgroup,
        currentPage: newCurrent,
        storeSelected: storeSelected
      })

      if (products.error) {
        setErrorSearchProduct(true)
        setListStripeProducts([])
        setTarjaDepartment('')
        throw new Error(products.error)
      }

      setListStripeProducts(products)
      setPageTarjaMark(tarjaMark)
      setPageTarjaDescription(tarjaDescription)

      let tarjaFilteredProducts = products

      if (tarjaEan) {
        setTarjaDepartment('')
        const productByEan = tarjaFilteredProducts.find((item) => item.barra_key === tarjaEan)
        if (productByEan) {
          setLoading(false)
          return productByEan ? [productByEan] : []
        }
      }

      if (tarjaDescription) {
        const regex = new RegExp(tarjaDescription, 'i')
        tarjaFilteredProducts = tarjaFilteredProducts.filter((item) => regex.test(item.descricao))
      }

      if (tarjaDepartment) {
        tarjaFilteredProducts = tarjaFilteredProducts.filter(
          (item) => item.departamento === tarjaDepartment
        )
      }

      if (tarjaSection) {
        tarjaFilteredProducts = tarjaFilteredProducts.filter((item) => item.secao === tarjaSection)
      }

      if (tarjaGroup) {
        tarjaFilteredProducts = tarjaFilteredProducts.filter((item) => item.grupo === tarjaGroup)
      }

      if (tarjaSubgroup) {
        tarjaFilteredProducts = tarjaFilteredProducts.filter(
          (item) => item.subgrupo === tarjaSubgroup
        )
      }

      setLoading(false)
      return tarjaFilteredProducts
    } catch (error) {
      const userMessage = error.message || 'Erro ao buscar produtos.'
      setLoading(false)
    }
  }

  const handleValidate = async (ean) => {
    const products = await findProduct()
    print(products)
  }

  const handleKeyDown = async () => {
    if (tarjaEan.key === 'Enter') {
      const products = await findProduct()
      print(products)
      handleClearInputPrint()
    }
  }

  const handleTarjaSelect = (e) => {
    e.preventDefault()
    focusInput()
    const results = findProduct()

    const filteredResults = results || []
    setTarjaFilteredProducts(filteredResults)
  }

  const handleTarjaQuantityChange = (productKey, value) => {
    setTarjaQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productKey]: value
    }))
  }

  const handleTarjaCheckboxChange = (product) => {
    setTarjaSelectedProducts((prevSelected) => {
      if (listProducts.length > 1) {
        return listProducts
      } else {
        const isSelected = prevSelected.some((p) => p.barra_key === product.barra_key)
        if (isSelected) {
          return prevSelected.filter((p) => p.barra_key !== product.barra_key)
        } else {
          return [...prevSelected, product]
        }
      }
    })
  }

  const handleTarjaPrintTicket = (event) => {
    event.preventDefault()
    if (listStripeProducts.length > 1) {
      const productsToPrint = tarjaSelectedProducts.map((product) => ({
        ...product,
        quantity: tarjaQuantities[product.barra_key] || 1
      }))

      print(productsToPrint)
      handleClearInputPrint()
      focusInput()
      return
    }

    if (listStripeProducts.length === 1) {
      const productsToPrintOne = listStripeProducts.map((product) => ({
        ...product,
        quantity: tarjaQuantities[product.barra_key] || 1
      }))
      print(productsToPrintOne)
      focusInput()
      return
    }

    if (listProducts.length >= 0) {
      const listProductsItems = listProducts.map((product) => ({
        ...product,
        quantity: tarjaQuantities[product.barra_key] || product.quantidade || 1
      }))

      print(listProductsItems)
      focusInput()
      return
    }

    if (tarjaSelectedProducts.length === 0) {
      toast.error('Atenção! Selecione ao menos um produto para realizar a impressão.', {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: 'light',
        transition: Bounce
      })
      return
    }
  }

  const handlePrintMarkdown = async () => {
    setListMarkdownProducts([])

    try {
      const productsToPrint =
        listMarkdownProducts.length > 0
          ? listMarkdownProducts
          : await window.electron.ipcRenderer.invoke('listMarkdownProducts', {
              storeSelected: storeSelected
            })

      focusInput()

      window.electron.ipcRenderer.send('printMarkdown', { product: productsToPrint })

      // window.electron.ipcRenderer.once('print-error', () => {
      //   setMarkdownTimeError(
      //     'Já passou o prazo para impressão. Apenas é permitido imprimir entre 00:01 e 14:00.'
      //   )
      // })

      setListMarkdownProducts([])
    } catch (error) {
      console.error('Error fetching or printing data:', error)
    }
  }

  const handleLogin = (event) => {
    event.preventDefault()
    setMarkdownTimeError('')

    const isDocumentEmpty = !document.trim()
    const isPasswordEmpty = !password.trim()

    if (isDocumentEmpty || isPasswordEmpty) {
      setDocumentError(isDocumentEmpty)
      setPasswordError(isPasswordEmpty)
      setLoginError('')
      return
    }

    setDocumentError(false)
    setPasswordError(false)

    window.electron.ipcRenderer.send('login', { document, password })

    window.electron.ipcRenderer.once('login-success', () => {
      setHiddenMarkdownLogin(true)
      setHiddenMarkdownPrint(true)
      setListMarkdownProducts([])
    })

    window.electron.ipcRenderer.once('login-failure', (event, errorMessage) => {
      setLoginError(errorMessage)
    })

    setListMarkdownProducts([])
  }

  const handleConfirm = () => {
    window.electron.ipcRenderer.send('set-selected-printer', {
      selectedPrinterWithDiscount,
      selectedPrinterWithoutDiscount,
      storeSelected
    })

    setPrintConfigModal(false)
    setButtonSelectedConfigPrint(false)
    setListStoreError(false)
    setTarjaFilteredProducts('')
    focusInput()
  }

  const handleListChange = async (selectedValue) => {
    setTarjaDepartment('')
    setListStripeProducts([])
    setSections([])
    setGroups([])
    setSubGroups([])

    setListsSelected(selectedValue)
    if (selectedValue === '') {
      return
    }
  }

  const handleStoreChange = (value) => {
    setStoreSelected(value)
  }

  const handleDepartmentChange = async (selectedValue) => {
    setTarjaDepartment(selectedValue)
    setTarjaSection('')
    setTarjaGroup('')
    setTarjaSubgroup('')

    if (selectedValue === '') {
      setSections([])
      setGroups([])
      setSubGroups([])
      return
    }

    const sections = await window.electron.ipcRenderer.invoke('filter-section', { selectedValue })
    setSections(sections)
  }

  const handleSectionChange = async (selectedValue) => {
    setTarjaSection(selectedValue)
    setTarjaGroup('')
    setTarjaSubgroup('')

    if (selectedValue === '') {
      setGroups([])
      setSubGroups([])
      return
    }

    const groups = await window.electron.ipcRenderer.invoke('filter-group', {
      selectedValue
    })
    setGroups(groups)
  }

  const handleGroupChange = async (selectedValue) => {
    setTarjaGroup(selectedValue)
    setTarjaSubgroup('')

    if (selectedValue === '') {
      setSubGroups([])
      return
    }

    const subgroups = await window.electron.ipcRenderer.invoke('filter-sub-group', {
      selectedValue
    })
    setSubGroups(subgroups)
  }

  const handleSubgroupChange = (selectedValue) => {
    setTarjaSubgroup(selectedValue)
  }

  const handleCloseModalMarkdown = () => {
    setDocument('')
    setPassword('')
    setMarkdownLoginModal(false)
    setButtonSelectedMarkdown(false)
    setHiddenMarkdownLogin(false)
    setHiddenMarkdownPrint(false)

    setDocumentError(false)
    setPasswordError(false)
    setTarjaEan('')
    setTarjaEanError(false)

    focusInput()
  }

  const handleToggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const columns = [
    { key: 'select', label: 'Selecionar' },
    { key: 'quantity', label: 'Quantidade' },
    { key: 'id', label: 'Cód. EAN' },
    { key: 'description', label: 'Descrição' },
    { key: 'price', label: 'Preço normal' },
    { key: 'price_offer', label: 'Preço promoção' },
    { key: 'brand', label: 'Marca' }
  ]

  const handleLabelSelected = useCallback((selectedValue) => {
    if (listProducts.length > 1) {
      setLabelTypeSelect(listProducts.tipo_etiqueta)
    }

    setLabelTypeSelect(selectedValue)
    focusInput()
  }, [])

  const labelType = [
    { value: 'R', label: 'Reduzida' },
    { value: 'F', label: 'Fardo' },
    // { value: 'SM', label: 'Moda' },
    // { value: 'M', label: 'Magazine' }
  ]
  return (
    <>
      <Flowbite>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-1 p-4 dark:bg-gray-900 dark:text-gray-100">
            <nav className="flex justify-between ">
              <Header h1={'Sistema de'} mark={'Tarja'} />

              <div>
                <button
                  type="button"
                  className={`focus:outline-none text-white font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2
        ${isButtonSelectedMarkdown ? 'bg-orange-800 hover:bg-orange-950' : 'bg-gray-800 hover:bg-gray-900'}`}
                  onClick={() => {
                    setMarkdownLoginModal(true)
                    setButtonSelectedMarkdown(true)
                  }}
                >
                  <h5 className="font-bold text-white">Remarcação Total/Parcial</h5>
                  {markdownLoginModal && (
                    <Modal
                      isOpen={markdownLoginModal}
                      onClose={() => {
                        setMarkdownLoginModal(false)
                        setButtonSelectedMarkdown(false)
                        setHiddenMarkdownLogin(false)
                        setHiddenMarkdownPrint(false)
                        setPasswordError(false)
                        setDocumentError(false)
                        setLoginError(false)

                        setDocument('')
                        setPassword('')
                        focusInput()
                      }}
                      onCloseModal={handleCloseModalMarkdown}
                      textHeaderModal={'Remarcação Total/Parcial'}
                    >
                      <div
                        hidden={hiddenMarkdownLogin}
                        className="p-6 md:p-8 bg-white rounded-lg shadow-lg"
                      >
                        <form className="space-y-3">
                          <div>
                            <InputText
                              label={'Usuário'}
                              id="document"
                              value={document}
                              onChange={setDocument}
                              placeholder="Digite o seu usuário do TS"
                              inputMode="text"
                              className={`w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${documentError ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {documentError && (
                              <p className="text-red-500 font-bold">Preencha o campo usuário</p>
                            )}
                          </div>
                          <div>
                            <PasswordInput
                              value={password}
                              onChange={setPassword}
                              label="Senha"
                              placeholder="Digite sua senha"
                              inputMode="text"
                              showPassword={showPassword}
                              onToggleShowPassword={handleToggleShowPassword}
                              className={`w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {passwordError && (
                              <p className="text-red-500 font-bold">Preencha o campo Senha</p>
                            )}
                          </div>

                          {loginError && (
                            <p className=" mt-3 text-white bg-red-700 font-bold rounded p-2">
                              {loginError}
                            </p>
                          )}

                          <ButtonSub
                            onClickSub={handleLogin}
                            textButton={'Acessar'}
                            icon={
                              <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-gray-100 hover:text-gray-100" />
                            }
                          />
                        </form>
                      </div>

                      <div
                        hidden={!hiddenMarkdownPrint}
                        className="p-6 md:p-8 bg-white rounded-lg shadow-lg"
                      >
                        <div className="p-6 bg-gray-50 text-medium text-gray-500 dark:text-gray-100 dark:bg-gray-800 rounded-lg w-full">
                          <LoadingOverlay isLoading={loading} />

                          <div className="overflow-x-auto">
                            <div className="flex justify-center">
                              <button
                                onClick={handlePrintMarkdown}
                                className="
                                px-8 py-3.5 text-base font-medium text-white inline-flex items-center
                                bg-orange-400 hover:bg-orange-500 border-none transition-colors  rounded-md shadow-sm focus:outline-none focus:ring-0 focus:ring-offset-0
                                 "
                                disabled={false}
                              >
                                <PrinterIcon className="h-5 w-full mr-2 text-gray-100 hover:text-gray-100" />{' '}
                                Imprimir
                              </button>
                            </div>

                            {markdownTimeError && (
                              <p className=" mt-3 text-white bg-red-700 font-bold rounded p-2">
                                {markdownTimeError}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Modal>
                  )}
                </button>
              </div>

              {/*<div>*/}
              {/*  <EditableLabel*/}
              {/*    text="Etiqueta Manipulável"*/}
              {/*    openModal={() => setEditableLabelModal(true)}*/}
              {/*  />*/}

              {/*  {editableLabelModal && (*/}
              {/*    <Modal*/}
              {/*      isOpen={editableLabelModal}*/}
              {/*      onClose={() => setEditableLabelModal(false)}*/}
              {/*      textHeaderModal="Etiqueta Manipulável"*/}
              {/*    >*/}
              {/*      <FormEditableLabel />*/}
              {/*    </Modal>*/}
              {/*  )}*/}
              {/*</div>*/}
            </nav>

            <div className="p-6 bg-gray-50 text-medium text-gray-500 dark:text-gray-100 dark:bg-gray-800 rounded-lg w-full">
              <LoadingOverlay isLoading={loading} />
              <div>
                <ToastContainer />
              </div>

              <div className="space-y-6 mb-4">
                <div className="grid gap-6 mb-6 md:grid-cols-4">
                  <div>
                    <InputNumber
                      onKeyDown={handleKeyDown}
                      ref={inputRef}
                      value={tarjaEan}
                      onChange={setTarjaEan}
                      label={'Código EAN/QR CODE'}
                      placeholder={'Insira o código EAN/QR CODE'}
                      inputMode={'number'}
                      className={'w-full mb-1'}
                      onValidate={handleValidate}
                    />

                    {tarjaEanError && (
                      <div className="flex items-center gap-1">
                        <ExclamationTriangleIcon className="flex-row h-5 text-red-500 hover:text-red-700" />
                        <p className="text-red-500 font-bold text-sm">
                          Preencha o campo Código EAN
                        </p>
                      </div>
                    )}
                  </div>

                  <SelectOptions
                    labelText={'Tipo de etiqueta'}
                    selectedValue={labelTypeSelect}
                    handleChange={handleLabelSelected}
                    options={labelType}
                    errorMessage={''}
                    disabled={listsSelected}
                    normalOption={{ value: 'N', label: 'Normal' }}
                  />
                </div>

                <div className="grid gap-9 mb-9 md:grid-cols-3">
                  <div>
                    <InputText
                      value={tarjaDescription}
                      onChange={setTarjaDescription}
                      label={'Descrição'}
                      placeholder={'Digite a descrição do produto'}
                      inputMode={''}
                      className={'w-full mb-1'}
                    />

                    {tarjaDescriptionError && (
                      <div className="flex items-center gap-1">
                        <ExclamationTriangleIcon className="w- h-5 text-red-500 hover:text-red-700" />
                        <p className="text-red-500 font-bold text-sm">Preencha o campo Descrição</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <InputText
                      value={tarjaMark}
                      onChange={setTarjaMark}
                      label={'Marca'}
                      placeholder={'Digite a marca do produto'}
                      inputMode={''}
                      className={'w-full mb-1'}
                    />

                    {tarjaMarkError && (
                      <div className="flex items-center gap-1">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 hover:text-red-700" />
                        <p className="text-red-500 font-bold text-sm">
                          Preencha o campo Marca do Produto
                        </p>
                      </div>
                    )}
                  </div>

                  <SelectOptions
                    labelText={'Lista de produtos'}
                    selectedValue={listsSelected}
                    handleChange={handleListChange}
                    options={lists}
                    error={listsSelectedError}
                    errorMessage={'Selecione uma lista de produto'}
                    normalOption={{ value: '', label: 'Selecione' }}
                    disabled={tarjaDepartment}
                    onFocus={loadList}
                  />
                </div>

                <div className="grid gap-6 mb-6 md:grid-cols-4">
                  <SelectOptions
                    labelText={'Departamento'}
                    selectedValue={tarjaDepartment}
                    handleChange={handleDepartmentChange}
                    options={departments}
                    error={tarjaDepartmentError}
                    errorMessage={'Selecione um Departamento'}
                    normalOption={{ value: '', label: 'Selecione' }}
                    disabled={listsSelected}
                  />

                  <SelectOptions
                    labelText={'Seção'}
                    selectedValue={tarjaSection}
                    handleChange={handleSectionChange}
                    options={sections}
                    error={tarjaSectionError}
                    errorMessage={'Selecione uma Seção'}
                    clearOnNoSelection={tarjaSection}
                    disabled={!tarjaDepartment}
                    normalOption={{ value: '', label: 'Selecione' }}
                  />

                  <SelectOptions
                    labelText={'Grupo'}
                    selectedValue={tarjaGroup}
                    handleChange={handleGroupChange}
                    options={groups}
                    error={tarjaGroupError}
                    errorMessage={'Selecione um Grupo'}
                    disabled={!tarjaSection}
                    normalOption={{ value: '', label: 'Selecione' }}
                  />

                  <SelectOptions
                    labelText={'Sub-grupo'}
                    selectedValue={tarjaSubgroup}
                    handleChange={handleSubgroupChange}
                    options={subGroups}
                    error={tarjaSubGroupError}
                    errorMessage={'Selecione um Sub-Grupo'}
                    disabled={!tarjaGroup}
                    normalOption={{ value: '', label: 'Selecione' }}
                  />
                </div>
              </div>

              <div className="flex justify-end mb-4">
                <ButtonSub
                  onClickSub={handleTarjaSelect}
                  textButton={'Pesquisar'}
                  icon={
                    <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-gray-100 hover:text-gray-100" />
                  }
                />
              </div>

              {errorSearchProduct && (
                <Dialog
                  open={errorSearchProduct}
                  onClose={setErrorSearchProduct}
                  className="relative z-10"
                >
                  <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                  />

                  <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                      <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                      >
                        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                          <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                              <ExclamationTriangleIcon
                                aria-hidden="true"
                                className="h-6 w-6 text-red-600"
                              />
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                              <DialogTitle
                                as="h3"
                                className="text-base font-bold leading-6 text-gray-900"
                              >
                                Atenção!
                              </DialogTitle>
                              <div className="mt-2">
                                <p className="text-sm text-gray-500 font-semibold">
                                  Produto não foi localizado ou não faz parte das opções do filtro.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogPanel>
                    </div>
                  </div>
                </Dialog>
              )}

              {errorTypePrint && (
                <Dialog open={errorTypePrint} onClose={setErrorTypePrint} className="relative z-10">
                  <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                  />

                  <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                      <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                      >
                        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                          <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                              <ExclamationTriangleIcon
                                aria-hidden="true"
                                className="h-6 w-6 text-red-600"
                              />
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                              <DialogTitle
                                as="h3"
                                className="text-base font-bold leading-6 text-gray-900"
                              >
                                Atenção!
                              </DialogTitle>
                              <div className="mt-2">
                                <p className="text-sm text-gray-500 font-semibold">
                                  Este produto não está registrado como fardo. Por favor, verifique
                                  ou altere o tipo de etiqueta, ou revise os itens na lista de
                                  produtos.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogPanel>
                    </div>
                  </div>
                </Dialog>
              )}

              <div className="overflow-x-auto">
                <div className="p-6 font-semibold bg-white dark:bg-gray-900 shadow-lg rounded-lg">
                  <div className="overflow-y-auto h-50">
                    <DataTable
                      columns={columns}
                      content={
                        <tbody className="bg-white text-center dark:bg-gray-900  divide-y divide-gray-200 dark:divide-gray-700">
                          {listStripeProducts.map((item) => (
                            <tr
                              key={item.barra_key}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                {listStripeProducts.length > 1 ? (
                                  <input
                                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:ring-blue-500 rounded-md focus:ring-blue-500"
                                    type="checkbox"
                                    checked={tarjaSelectedProducts.some(
                                      (p) => p.barra_key === item.barra_key
                                    )}
                                    onChange={() => handleTarjaCheckboxChange(item)}
                                  />
                                ) : (
                                  <input
                                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:ring-blue-500 rounded-md focus:ring-blue-500"
                                    type="checkbox"
                                    checked="disabled"
                                    onChange={() => handleTarjaCheckboxChange(item)}
                                  />
                                )}
                              </td>

                              <td className=" whitespace-nowrap text-sm text-gray-900 font-bold dark:text-gray-100">
                                <input
                                  placeholder={'1'}
                                  id={`quantity-${item.barra_key}`}
                                  type="text"
                                  pattern="[0-9]*"
                                  maxLength={2}
                                  value={tarjaQuantities[item.barra_key] || ''}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    if (
                                      /^\d*$/.test(value) &&
                                      (value === '' || (Number(value) >= 1 && Number(value) <= 20))
                                    ) {
                                      handleTarjaQuantityChange(item.barra_key, Number(value))
                                    }
                                  }}
                                  className="w-24 h-10 text-center border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                              </td>

                              <td className="whitespace-nowrap text-sm text-gray-900 font-bold dark:text-gray-100">
                                {item.barra_key}
                              </td>

                              <td className=" whitespace-nowrap text-sm text-gray-700 font-bold dark:text-gray-300">
                                {item.descricao}
                              </td>

                              <td className=" whitespace-nowrap text-sm text-gray-700 font-bold dark:text-gray-300">
                                {parseFloat(item.normal).toFixed(2).replace('.', ',')}
                              </td>

                              <td className=" whitespace-nowrap text-sm text-red-700 font-bold dark:text-gray-300">
                                {item.oferta ? (
                                  parseFloat(item.oferta).toFixed(2).replace('.', ',') ===
                                  '0,00' ? (
                                    <span className="line-through text-gray-700 font-bold">
                                      {parseFloat(item.oferta).toFixed(2).replace('.', ',')}
                                    </span>
                                  ) : (
                                    parseFloat(item.oferta).toFixed(2).replace('.', ',')
                                  )
                                ) : null}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-bold dark:text-gray-300">
                                {item.marcas}
                              </td>
                            </tr>
                          ))}

                          {listProducts.map((item) => (
                            <tr
                              key={item.barra_key}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                {listStripeProducts.length > 1 ? (
                                  <input
                                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:ring-blue-500 rounded-md focus:ring-blue-500"
                                    type="checkbox"
                                    checked={true}
                                    onChange={() => handleTarjaCheckboxChange(item)}
                                  />
                                ) : (
                                  <input
                                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:ring-blue-500 rounded-md focus:ring-blue-500"
                                    type="checkbox"
                                    checked={true}
                                    onChange={() => handleTarjaCheckboxChange(item)}
                                  />
                                )}
                              </td>

                              <td className="whitespace-nowrap text-sm text-gray-900 font-bold dark:text-gray-100">
                                <input
                                  placeholder={'1'}
                                  id={`quantity-${item.barra_key}`}
                                  type="text"
                                  pattern="[0-9]*"
                                  maxLength={2}
                                  value={item.quantidade}
                                  onChange={() => {
                                    handleTarjaQuantityChange(
                                      item.barra_key,
                                      Number(item.quantidade)
                                    )
                                  }}
                                  className="w-24 h-10 text-center border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                              </td>

                              <td className="whitespace-nowrap text-sm text-gray-900 font-bold dark:text-gray-100">
                                {item.barra_key}
                              </td>

                              <td className=" whitespace-nowrap text-sm text-gray-700 font-bold dark:text-gray-300">
                                {item.descricao}
                              </td>

                              <td className=" whitespace-nowrap text-sm text-gray-700 font-bold dark:text-gray-300">
                                {parseFloat(item.normal).toFixed(2).replace('.', ',')}
                              </td>

                              <td className=" whitespace-nowrap text-sm text-red-700 font-bold dark:text-gray-300">
                                {item.oferta ? (
                                  parseFloat(item.oferta).toFixed(2).replace('.', ',') ===
                                  '0,00' ? (
                                    <span className="line-through text-gray-700 font-bold">
                                      {parseFloat(item.oferta).toFixed(2).replace('.', ',')}
                                    </span>
                                  ) : (
                                    parseFloat(item.oferta).toFixed(2).replace('.', ',')
                                  )
                                ) : null}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-bold dark:text-gray-300">
                                {item.marcas}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      }
                    />
                  </div>

                  <div className="mt-2 flex flex-col sm:flex-row justify-between items-center">
                    <button
                      onClick={handlePagesPreview}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg shadow-lg  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>

                    <span className="text-sm text-gray-700 dark:text-gray-300 mt-2 sm:mt-0">
                      Página {currentPage} de {totalPages}
                    </span>

                    <button
                      onClick={handlePagesNext}
                      disabled={listStripeProducts.length < 5}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg shadow-lg  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex content-center justify-between mt-4">
                <div>
                  <button
                    type="button"
                    className={`focus:outline-none text-white font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2
        ${isButtonSelectedConfigPrint ? 'bg-orange-800 hover:bg-orange-950' : 'bg-gray-800 hover:bg-gray-900'}`}
                    onClick={() => {
                      setPrintConfigModal(true)
                      setButtonSelectedConfigPrint(true)
                    }}
                  >
                    Configurar Impressora
                    {printConfigModal && (
                      <Modal
                        isOpen={printConfigModal}
                        onClose={() => {
                          setPrintConfigModal(false)
                          setButtonSelectedConfigPrint(false)
                          focusInput
                        }}
                        onCloseModal={handleConfirm}
                        textHeaderModal={'Configurações de Impressão'}
                      >
                        <div className="p-6 md:p-8 bg-white rounded-lg shadow-lg">
                          {/*<SelectOptions*/}
                          {/*  labelText={'Lojas'}*/}
                          {/*  selectedValue={storeSelected}*/}
                          {/*  handleChange={handleStoreChange}*/}
                          {/*  options={listStore}*/}
                          {/*  error={listStoreError}*/}
                          {/*  errorMessage={'Selecione uma Loja'}*/}
                          {/*  normalOption={{*/}
                          {/*    value: '', label: storeSelected.length !== ''*/}
                          {/*      ? 'Selecione uma Loja'*/}
                          {/*      : storeSelected*/}
                          {/*  }}*/}
                          {/*/>*/}

                          <SelectOptions
                            labelText={'Loja'}
                            selectedValue={storeSelected}
                            handleChange={handleStoreChange}
                            options={listStore}
                            error={listStoreError}
                            errorMessage={'Selecione uma loja'}
                            normalOption={{ value: '', label: 'Selecione' }}
                            disabled={tarjaDepartment}
                          />

                          <PrinterSelector
                            title={'Impressora Padrão'}
                            placeholder={
                              valueSelectedPrinterWithDiscount ?? 'Selecione uma impressora'
                            }
                            onSelect={setSelectedPrinterWithDiscount}
                            selectedPrinter={selectedPrinterWithDiscount}
                            printerOptions={printers}
                          />

                          <PrinterSelector
                            title={'Impressora Promoção'}
                            placeholder={
                              valueSelectedPrinterWithoutDiscount.length === ''
                                ? 'Selecione uma impressora'
                                : valueSelectedPrinterWithoutDiscount
                            }
                            onSelect={setSelectedPrinterWithoutDiscount}
                            selectedPrinter={selectedPrinterWithoutDiscount}
                            printerOptions={printers}
                          />

                          {printerError && (
                            <p className="m-3  text-white bg-red-700 font-bold rounded p-2">
                              Atencao! Uma das impressoras nao foi selecionada
                            </p>
                          )}

                          <ButtonSub
                            onClickSub={handleConfirm}
                            textButton={'Salvar Configurações'}
                            colorButton={'blue'}
                            icon={
                              <ArrowRightCircleIcon className="h-5 w-5 mr-2 text-gray-100 hover:text-gray-100" />
                            }
                          />
                        </div>
                      </Modal>
                    )}
                  </button>
                </div>

                <ButtonSub
                  onClickSub={handleTarjaPrintTicket}
                  textButton={' Imprimir'}
                  colorButton={'bg-emerald-600'}
                  colorButtonHover={'bg-emerald-900'}
                  icon={<PrinterIcon className="text-gray-100 hover:text-gray-100" />}
                />
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </Flowbite>
    </>
  )
}
