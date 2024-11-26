/** @type {import('tailwindcss').Config} */
const flowbite = require('flowbite-react/tailwind')

/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', flowbite.content()],
  theme: {
    extend: {}
  },
  datatables: true,
  plugins: [
    flowbite.plugin({
      datatables: true
    })
  ]
}
