import React from 'react'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { defaultTheme } from '@oxide/theme'

import App from './app'

// Don't use this with snapshot testing, see:
//  - https://github.com/styled-components/jest-styled-components#theming
//  - https://github.com/styled-components/jest-styled-components/issues/61
const renderWithTheme = (Component) =>
  render(<ThemeProvider theme={defaultTheme}>{Component}</ThemeProvider>)

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithTheme(<App />)

    expect(baseElement).toBeTruthy()
  })
})
