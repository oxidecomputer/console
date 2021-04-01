import type { FC, ReactElement } from 'react'
import React from 'react'
import type { RenderOptions } from '@testing-library/react'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { defaultTheme } from '@oxide/theme'
import { SWRConfig } from 'swr'

const Providers: FC = ({ children }) => (
  <SWRConfig value={{ dedupingInterval: 0 }}>
    <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>
  </SWRConfig>
)

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => render(ui, { wrapper: Providers, ...options })

export * from '@testing-library/react'
export { customRender as render }
