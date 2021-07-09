import type { FC, ReactElement } from 'react'
import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import type { RenderOptions } from '@testing-library/react'
import { render } from '@testing-library/react'

const Providers: FC = ({ children }) => <Router>{children}</Router>

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => render(ui, { wrapper: Providers, ...options })

export * from '@testing-library/react'
export { customRender as render }
