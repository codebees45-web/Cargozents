
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
      keyframes: {
  'truck-drive': {
    '0%': { transform: 'translateX(-25%)' },
    '100%': { transform: 'translateX(125%)' },
  },
  'truck-bounce': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-3px)' },
  },
  'wheel-spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  'road-scroll': {
    '0%': { backgroundPositionX: '0px' },
    '100%': { backgroundPositionX: '-48px' },
  },
  'exhaust-puff': {
    '0%': { transform: 'scale(0.4) translateX(0)', opacity: '0.5' },
    '100%': { transform: 'scale(1.4) translateX(-14px)', opacity: '0' },
  },
},
animation: {
  'truck-drive': 'truck-drive 2.8s linear infinite',
  'truck-bounce': 'truck-bounce 0.5s ease-in-out infinite',
  'wheel-spin': 'wheel-spin 0.55s linear infinite',
  'road-scroll': 'road-scroll 0.6s linear infinite',
  'exhaust-puff': 'exhaust-puff 1s ease-out infinite',
},
    },
  },
  plugins: [],
};
