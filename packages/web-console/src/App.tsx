import React, { FC } from 'react'
import { Component, ThemeProvider, defaultTheme } from '@oxide/ui'

export const App: FC = () => (
  <ThemeProvider theme={defaultTheme}>
    <div>
      <h1>Hello from React!</h1>
      <Component />
    </div>
  </ThemeProvider>
)
