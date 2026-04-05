/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          zen: {
            gold: '#b58900',      // Vàng đồng
            goldLight: '#e6b800',
            earth: '#2d3436',     // Xám đá trầm
            sand: '#f8f9fa',      // Nền cát nhạt
            border: 'rgba(0,0,0,0.05)'
          }
        },
        animation: {
          'scan-line': 'scan 3s linear infinite',
        },
        keyframes: {
          scan: {
            '0%, 100%': { top: '0%' },
            '50%': { top: '100%' },
          }
        }
      },
    },
    plugins: [],
  }