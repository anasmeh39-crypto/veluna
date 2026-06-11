/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        veluna: {
          cream:    '#FFF7FB',
          blush:    '#F6EEFF',
          petal:    '#EADDEA',
          mauve:    '#D98DA8',
          rose:     '#C4738A',
          plum:     '#7A3E68',
          lavender: '#DCC7FF',
          pink:     '#F8BBD0',
          dark:     '#2F2430',
          text:     '#2F2430',
          muted:    '#7B6A78',
          light:    '#FFF9FC',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'sans-serif'],
      },
      animation: {
        'slide-up':   'slideUp 0.32s cubic-bezier(0.22,1,0.36,1)',
        'fade-in':    'fadeIn 0.3s ease-out',
        'fade-up':    'fadeUp 0.45s cubic-bezier(0.22,1,0.36,1)',
        'scale-in':   'scaleIn 0.25s cubic-bezier(0.22,1,0.36,1)',
        'bounce-sm':  'bounceSm 0.4s cubic-bezier(0.22,1,0.36,1)',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        bounceSm: {
          '0%':   { transform: 'scale(0.9)',  opacity: '0' },
          '60%':  { transform: 'scale(1.04)', opacity: '1' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22,1,0.36,1)',
      },
      boxShadow: {
        'veluna-sm':  '0 2px 8px rgba(122,62,104,0.10)',
        'veluna-md':  '0 4px 20px rgba(122,62,104,0.14)',
        'veluna-lg':  '0 8px 32px rgba(122,62,104,0.18)',
        'cart':       '0 -4px 24px rgba(122,62,104,0.15)',
      },
    },
  },
  plugins: [],
}
