import React from 'react'

export function PrinterSelector({ title, placeholder, onSelect, selectedPrinter, printerOptions }) {
  return (
    <div className="w-full mb-4">
      <h2 className="text-md font-semibold text-gray-700">{title}</h2>
      <select
        onChange={(e) => onSelect(e.target.value)}
        value={selectedPrinter}
        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option disabled value="">
          {placeholder}
        </option>
        {printerOptions.map((printer, index) => (
          <option key={index} value={printer}>
            {printer}
          </option>
        ))}
      </select>
    </div>
  )
}
