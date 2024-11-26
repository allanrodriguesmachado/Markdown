import axios from 'axios'

export class FilterDepart {
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
          Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MzEwNjk4MDEsInVpZCI6MTIzNDU2Nzg5MTB9.3C6wlt6Afqg7nVB_E-ZtiOvcs6pJDDcPlmvTR-OrZp4`,
          'Content-Type': 'application/json'
        },
        data: this.selectedValue
      })

      return response.data.map((department: any) => ({
        label: department.nome,
        value: department.departamento_key
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
