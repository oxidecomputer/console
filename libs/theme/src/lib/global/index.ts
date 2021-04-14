import { createGlobalStyle, css } from 'styled-components'
import { normalize } from './normalize'

import './fonts.css'

const globalStyles = css`
  * {
    box-sizing: inherit;
  }
  html,
  body {
    box-sizing: border-box;

    background-color: ${(props) => props.theme.themeColors.gray900};
    color: ${(props) => props.theme.themeColors.gray300};
    font-family: ${(props) => props.theme.fonts.mono};
    font-weight: 400;
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
  a {
    color: inherit;
    text-decoration: none;
  }
  :focus {
    outline: none;
    outline-color: transparent
    outline-style: auto;
    outline-width: 0;
}
`

export const GlobalStyle = createGlobalStyle`
  ${normalize}
  ${globalStyles}
`
