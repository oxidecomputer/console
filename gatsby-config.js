module.exports = {
  siteMetadata: {
    title: 'Oxide Console'
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-plugin-chakra-ui',
      options: {
        isUsingColorMode: false
      }
    },
    {
      resolve: 'gatsby-plugin-prefetch-google-fonts',
      options: {
        fonts: [
          {
            family: 'Inter',
            variants: ['300', '400', '700']
          },
          {
            family: 'Open Sans',
            variants: ['400', '700']
          }
        ]
      }
    }
  ]
};
