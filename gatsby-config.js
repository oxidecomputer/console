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
    }
  ]
};
