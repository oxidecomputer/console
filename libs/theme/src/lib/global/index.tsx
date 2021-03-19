import React from 'react'
import { createGlobalStyle } from 'styled-components'
import tw, { GlobalStyles as BaseStyles, theme } from 'twin.macro'

import './fonts.css'

const CustomStyles = createGlobalStyle`
  * {
    box-sizing: inherit;
  }
  html {
    line-height: 1;
    -webkit-text-size-adjust: 100%;
  }
  html,
  body {
    ${tw`box-border bg-primary text-primary font-mono font-normal`}
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  ol,
  ul {
    margin: 0;
    padding: 0;
  }
  ol,
  ul {
    list-style-type: none;
  }
  img {
    width: 100%;
    height: auto;
  }
  abbr[title] {
    text-decoration: none;
  }
  a,
  a:link {
    ${tw`text-primary no-underline`}
  }
  a:visited {
    ${tw`text-primary underline`}
  }
  a:hover {
    ${tw`text-secondary`}
  }
  a:active {
    ${tw`text-gray-300`}
  }

  .light {
    --bg-primary: ${theme`colors.gray.50`};
    --bg-secondary: ${theme`colors.gray.100`};
    --text-primary: ${theme`colors.gray.900`};
    --text-secondary: ${theme`colors.green.900`};
    --color-primary: ${theme`colors.green.600`};
  }
  .dark {
    --bg-primary: ${theme`colors.gray.900`};
    --bg-secondary: ${theme`colors.gray.900`};
    --text-primary: ${theme`colors.green.50`};
    --text-secondary: ${theme`colors.green.500`};
    --color-primary: ${theme`colors.green.400`};
  }
  body {
    ${tw`bg-primary text-primary`}
  }
`

export const GlobalStyle = () => (
  <>
    <BaseStyles />
    <CustomStyles />
  </>
)
