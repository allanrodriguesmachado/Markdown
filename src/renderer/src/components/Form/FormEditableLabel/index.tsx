import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { registerLocale } from 'react-datepicker'
import ptBR from 'date-fns/locale/pt-BR'

registerLocale('pt-BR', ptBR)

export function FormEditableLabel() {
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  const today = new Date()

  return (
    <div className="m-28">
      <form className="sm:p-6 sm:pb-2">
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

              <div id="date-range-picker" className="flex items-center sm:col-span-full">
                <div className="relative">
                  <label
                    htmlFor="datepicker-range-start"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Data de início
                  </label>
                  <DatePicker
                    locale="pt-BR"
                    selected={startDate}
                    onChange={(date) => {
                      setStartDate(date)
                      if (endDate && date > endDate) {
                        setEndDate(null)
                      }
                    }}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={today}
                    placeholderText="Selecionar data de início"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  />
                </div>
                <span className="mx-4 text-gray-500">a</span>
                <div className="relative">
                  <label
                    htmlFor="datepicker-range-end"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Data de término
                  </label>
                  <DatePicker
                    locale="pt-BR"
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    placeholderText="Selecionar data de término"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
