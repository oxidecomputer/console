import type { GlobalProvider } from '@ladle/react'
import React from 'react'
import { StaticRouter } from 'react-router-dom/server'

import '../app/ui/styles/index.css'

export const Provider: GlobalProvider = ({ children }) => (
  // make things with RR links work
  <StaticRouter location="/">{children}</StaticRouter>
)
