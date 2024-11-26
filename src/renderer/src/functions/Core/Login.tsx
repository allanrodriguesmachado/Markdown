import axios from 'axios'
import React from 'react'

export class Login {
  private readonly event?: React.ChangeEvent<HTMLInputElement>
  private readonly user: string
  private readonly password: string
  private readonly typeApp: string
  private readonly typeDevice: string
  private readonly url: string
  private readonly method: string

  constructor(event: React.ChangeEvent<HTMLInputElement>, user: string, password: string, typeApp: string, typeDevice: string,  url: string, method: string = 'POST',) {
    this.event = event
    this.user = user
    this.password = password
    this.typeApp = typeApp
    this.typeDevice = typeDevice
    this.url = url
    this.method = method
  }

  login() {
    const FormData = require('form-data')
    const formDataToSend = new FormData()
    formDataToSend.append('usuario', this.user)
    formDataToSend.append('senha', this.password)
    formDataToSend.append('app', this.typeApp)
    formDataToSend.append('device', this.typeDevice)

    axios
      .request({
        method: this.method,
        maxBodyLength: Infinity,
        url: this.url,
        headers: {
          Cookie: 'PHPSESSID=90ff95039632696d958e9a9b611feb8e',
          ...formDataToSend.getHeaders()
        },
        data: formDataToSend
      })
      .then((response) => {
        if (response.status === 200) {
          this.event.reply('login-success')
          return JSON.stringify(response.data)
        }
      })
      .catch((error) => {
        this.event.reply('login-failure', 'Atenção! Usuário e/ou senha inválidos')
        return null
      })
  }
}
