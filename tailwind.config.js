
const { colors } = require('tailwindcss/defaultTheme')

module.exports = {
  purge: [
    './client/src/**/*.tsx',
  ],
  theme: {
    colors: {
      // Remove colors indigo and purple
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      red: colors.red,
      yellow: colors.yellow,
      green: colors.green,
      blue: colors.blue,
    },
    screens: {
      xs: true,
      sm: '640px',
      md: '768px',
      lg: '1024px',
    },
    fontFamily: {
      display: ['Gilroy', 'sans-serif'],
      body: ['Graphik', 'sans-serif'],
    },
    borderWidth: {
      default: '1px',
      '0': '0',
      '2': '2px',
      '4': '4px',
    },
    extend: {
      colors: {
        cyan: '#9cdbff',
      },
      spacing: {
        '96': '24rem',
        '128': '32rem',
      }
    },
    corePlugins: {
      objectFit: false,
      objectPosition: false,
    }
  },
  future: {
    purgeLayersByDefault: true,
    removeDeprecatedGapUtilities: true,
  },
}