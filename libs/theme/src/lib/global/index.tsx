import React from 'react'
import { createGlobalStyle } from 'styled-components'
import tw, { GlobalStyles as BaseStyles } from 'twin.macro'

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
    ${tw`box-border bg-gray-900 text-gray-300 font-mono font-normal`}
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
    ${tw`text-gray-100 no-underline`}
  }
  a:visited {
    ${tw`text-gray-100 underline`}
  }
  a:hover {
    ${tw`text-green-500`}
  }
  a:active {
    ${tw`text-gray-300`}
  }
`

export const GlobalStyle = () => (
  <>
    <BaseStyles />
    <CustomStyles />
  </>
)
