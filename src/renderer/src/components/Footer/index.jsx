import React from 'react';
import { Versions } from '../Versions';

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-800 text-gray-500 dark:text-gray-400 shadow-md">
      <div className="max-w-screen-xl mx-auto px-1 py-1 flex flex-col md:flex-row justify-between items-center">
        <span className="text-sm sm:text-base font-medium text-gray-400 dark:text-gray-300 text-center md:text-left">
          © 2024 <span className="font-semibold text-gray-100 dark:text-gray-200">Shibata Supermercados™</span>
        </span>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <span className="text-gray-100 font-bold dark:text-gray-300">
            <Versions />
          </span>
        </div>
      </div>
    </footer>
  );
}
