/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0D1117',
        surface: '#161B22',
        border: '#30363D',
        accent: '#7C3AED',
        success: '#238636',
        text: {
          primary: '#E6EDF3',
          secondary: '#8B949E',
        },
      },
      fontFamily: {
        ui: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      transitionDuration: {
        150: '150ms',
      },
      boxShadow: {
        'accent-glow': '0 0 0 1px #7C3AED',
      },
    },
  },
  plugins: [],
}

