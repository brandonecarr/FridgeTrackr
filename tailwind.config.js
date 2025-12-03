/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        expiration: {
          safe: {
            DEFAULT: '#10B981',
            light: '#D1FAE5',
            dark: '#065F46',
          },
          warning: {
            DEFAULT: '#F59E0B',
            light: '#FEF3C7',
            dark: '#92400E',
          },
          expired: {
            DEFAULT: '#EF4444',
            light: '#FEE2E2',
            dark: '#991B1B',
          },
        },
      },
    },
  },
  plugins: [],
};
