/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1890ff',
        success: '#52c41a',
        warning: '#faad14',
        error: '#ff4d4f',
      },
      keyframes: {
        breathe: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.2) translate(5%, 5%)' },
        }
      },
      animation: {
        breathe: 'breathe 15s infinite alternate ease-in-out',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
}
