import React from 'react'
import { LockClosedIcon, LockOpenIcon } from '@heroicons/react/16/solid'

export function PasswordInput({
  value,
  onChange,
  label,
  placeholder,
  inputMode,
  showPassword,
  onToggleShowPassword,
  className
}) {
  return (
    <div className="relative">
      <label
        htmlFor="password-input"
        className="block text-gray-700 text-sm font-bold mb-2 dark:text-white"
      >
        {label}
      </label>
      <div className="mt-2 flex items-center">
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          id="password-input"
          name="password-input"
          placeholder={placeholder}
          type={showPassword ? 'text' : 'password'}
          autoComplete="off"
          inputMode={inputMode}
          maxLength={15}
          className={`shadow-sm bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light ${className}`}
        />
        <button
          type="button"
          onClick={onToggleShowPassword}
          className="absolute inset-y-0 pt-6 right-0 flex items-center px-3"
        >
          {showPassword ? (
            <LockOpenIcon className="h-5 w-5 text-gray-500  hover:text-gray-700" />
          ) : (
            <LockClosedIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          )}
        </button>
      </div>
    </div>
  )
}
