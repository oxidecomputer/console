import type { FC, ReactElement } from 'react'
import React from 'react'
import type { RenderOptions } from '@testing-library/react'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { defaultTheme } from '@oxide/theme'

const Providers: FC = ({ children }) => (
  <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>
)

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => render(ui, { wrapper: Providers, ...options })

export * from '@testing-library/react'
export { customRender as render }
