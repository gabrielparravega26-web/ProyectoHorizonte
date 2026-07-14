/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta "pasaporte": azul tinta oficial + sello dorado + papel
        tinta: {
          50: '#eef1f7',
          100: '#d6ddec',
          300: '#8a9bc2',
          500: '#3b4f85',
          700: '#1f2f57',
          900: '#101b38',
        },
        sello: {
          400: '#c9a24b',
          500: '#b3872f',
          600: '#8f6a22',
        },
        papel: '#f7f4ec',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
