import React, { forwardRef, useCallback } from 'react'

const InputNumber = forwardRef(
  ({ onKeyDown, value, onChange, label, placeholder, inputMode, className, onValidate }, ref) => {
    const handleChange = useCallback(
      (e) => {
        onChange(e.target.value.replace(/[a-zA-Z]/g, ''))
        // onChange(e.target.value)
      },
      [onChange]
    )
    const handleKeyDown = useCallback(
      (e) => {
        if (e.key === 'Enter') {
          onValidate(value)
        }

        if (onKeyDown) {
          onKeyDown(e)
        }
      },
      [value, onKeyDown, onValidate]
    )

    return (
      <div>
        <label htmlFor="ean" className="block text-gray-700 text-sm font-bold mb-2 dark:text-white">
          {label}
        </label>
        <div className="mt-2">
          <input
            onKeyDown={handleKeyDown}
            ref={ref}
            value={value || ''}
            onChange={handleChange}
            id="ean"
            name="ean"
            placeholder={placeholder}
            type="text"
            autoComplete="off"
            inputMode={inputMode}
            maxLength={50}
            className={`shadow-sm bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light ${className}`}
          />
        </div>
      </div>
    )
  }
)

export default InputNumber
