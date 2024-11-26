import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/16/solid';

export function SelectOptions({
                                labelText,
                                selectedValue,
                                handleChange,
                                options,
                                error,
                                errorMessage,
                                clearOnNoSelection = false,
                                disabled,
                                normalOption,
                                onFocus
                              }) {
  const shouldClearOptions = clearOnNoSelection && !selectedValue;

  const displayOptions = shouldClearOptions
    ? options.filter(option => option.label !== 'Selecione')
    : options;

  return (
    <div>
      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
        {labelText}
      </label>

      <select
        disabled={disabled}
        id="department-select"
        value={selectedValue}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={(e) => onFocus(e.target.value)}
        className="shadow-sm bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
      >
        {!shouldClearOptions && <option value={normalOption.value}>{normalOption.label}</option>}
        {displayOptions.map((option) => (
          <option className="hover:bg-red-700" key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <div className="flex items-center gap-1 mt-2 text-red-500">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 hover:text-red-700" />
          <p className="font-bold text-sm">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
