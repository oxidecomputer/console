import React from 'react'
import { Global } from '@emotion/react'
import tw, { css, GlobalStyles as BaseStyles } from 'twin.macro'

import './fonts.css'

const customStyles = css`
  body {
    ${tw`box-border bg-black text-gray-50 font-mono font-normal`}
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
    ${tw`text-gray-200`}
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
    <Global styles={customStyles} />
  </>
)
