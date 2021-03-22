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

    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: ${(props) => props.theme.fonts.mono};
    font-weight: 500;
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

  .light {
    --bg-primary: ${({ theme }) => theme.themeColors.gray50};
    --bg-secondary: ${({ theme }) => theme.themeColors.gray100};
    --text-primary: ${({ theme }) => theme.themeColors.gray900};
    --text-secondary: ${({ theme }) => theme.themeColors.green900};
    --color-primary: ${({ theme }) => theme.themeColors.green600};
  }
  .dark {
    --bg-primary: ${({ theme }) => theme.themeColors.gray900};
    --bg-secondary: ${({ theme }) => theme.themeColors.gray900};
    --text-primary: ${({ theme }) => theme.themeColors.green50};
    --text-secondary: ${({ theme }) => theme.themeColors.green500};
    --color-primary: ${({ theme }) => theme.themeColors.green400};
  }
`

export const GlobalStyle = createGlobalStyle`
  ${normalize}
  ${globalStyles}
`
