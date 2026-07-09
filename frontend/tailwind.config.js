
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1B4D3E',
        accent: '#00E676',
        dark: '#1B4D3E',
        secondary: '#EEF4F1',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#FFFFFF',
        muted: '#5B7A70',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(0, 230, 118, 0.25)',
        card: '0 8px 30px rgba(27, 77, 62, 0.12)',
      },
    },
  },
  plugins: [],
};
