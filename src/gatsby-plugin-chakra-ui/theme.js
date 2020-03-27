import {theme} from '@chakra-ui/core';

export default {
  ...theme,
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
