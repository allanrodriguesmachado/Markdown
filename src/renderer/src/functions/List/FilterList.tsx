import axios from 'axios'

export class FilterList {
  private readonly category: string
  private readonly selectedValue: string | null
  private readonly method: string

  constructor(category: string, selectedValue: string, method: string = 'POST') {
    this.category = category
    this.selectedValue = selectedValue
    this.method = method
  }

  async recoveryFilter() {
    try {
      const response = await axios.request({
        method: this.method,
        url: `https://tarja.mercatus.com.br/${this.category}`,
        headers: {
          'Content-Type': 'application/json'
        },
        data: this.selectedValue
      })

      return response.data.map((list: any) => ({
        label: list.nome,
        value: list.id
      }))
    } catch (error) {
      console.error(
        'Erro ao buscar departamentos:',
        error.response ? error.response.data : error.message
      )
      throw error
    }
  }
}
