import React from 'react'
import { createGlobalStyle } from 'styled-components'
import tw, { GlobalStyles as BaseStyles } from 'twin.macro'

import './fonts.css'

const CustomStyles = createGlobalStyle`
  body {
    ${tw`box-border bg-blue-gray-900 text-gray-300 font-mono font-normal`}
  }

  // TW Preflight overrides w/ links to the lines they're overriding

  // https://github.com/ben-rogerson/twin.macro/blob/16911c0/src/config/preflightStyles.js#L19
  html {
    line-height: 1;
  }

  // https://github.com/ben-rogerson/twin.macro/blob/16911c0/src/config/preflightStyles.js#L175
  button:focus {
    outline: none;
  }

  // Present in real Preflight (a recent addition)
  // https://github.com/tailwindlabs/tailwindcss/blame/60b5d63/src/plugins/css/preflight.css#L144
  // but not twin.macro's version
  // https://github.com/ben-rogerson/twin.macro/blob/16911c0/src/config/preflightStyles.js#L225-L228
  input::placeholder,
  textarea::placeholder {
    opacity: 1;
  }

  // https://github.com/ben-rogerson/twin.macro/blob/16911c0/src/config/preflightStyles.js#L232
  button, [role="button"] {
    cursor: auto;
  }
  
  // https://github.com/ben-rogerson/twin.macro/blob/16911c0/src/config/preflightStyles.js#L274-L284
  svg {
    display: inline;
    vertical-align: baseline;
  }
`

export const GlobalStyle = () => (
  <>
    <BaseStyles />
    <CustomStyles />
  </>
)
