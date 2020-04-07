import {theme} from '@chakra-ui/core';

export default {
  ...theme,
  colors: {
    ...theme.colors,
    gray: {
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121'
    },
    'oxide-green': '#48d597'
  },
  fonts: {
    ...theme.fonts,
    body: 'Inter, system-ui, sans-serif',
    heading: 'Open Sans, serif',
    mono: 'Menlo, monospace'
  },
  sizes: {
    ...theme.sizes,
    '7xl': '80rem'
  }
};
