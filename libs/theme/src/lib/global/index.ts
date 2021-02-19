import { css, createGlobalStyle } from 'styled-components'
import { normalize } from './normalize'

const globalStyles = css`
  html,
  body {
    background-color: ${(props) => props.theme.themeColors.gray900};
    color: ${(props) => props.theme.themeColors.gray300};
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
  a,
  a:link {
    color: ${(props) => props.theme.themeColors.gray100};
    text-decoration: none;
  }
  a:visited {
    color: ${(props) => props.theme.themeColors.gray100};
    text-decoration: underline;
  }
  a:hover {
    color: ${(props) => props.theme.themeColors.green500};
  }
  a:active {
    color: ${(props) => props.theme.themeColors.gray300};
  }
`

export const GlobalStyle = createGlobalStyle`
  ${normalize}
  ${globalStyles}
`
