import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E8F5EE',
          100: '#C6E7D4',
          200: '#9AD6B5',
          300: '#6EC596',
          400: '#4AB87F',
          500: '#2D7A50',
          600: '#1B4332',
          700: '#153727',
          800: '#0F2A1D',
          900: '#091E13',
        },
        gold: {
          50: '#FDF8EB',
          100: '#FAEDCC',
          200: '#F3D98F',
          300: '#E8C460',
          400: '#D4A843',
          500: '#B8902E',
          600: '#967422',
          700: '#745A1A',
          800: '#524012',
          900: '#30260A',
        },
        slate: {
          950: '#0C1118',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
};

export default config;
