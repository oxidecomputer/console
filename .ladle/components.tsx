import React from 'react'
import { StaticRouter } from 'react-router-dom/server'

import '../libs/ui/styles/index.css'

import type { GlobalProvider } from "@ladle/react";

export const Provider: GlobalProvider = ({ children  }) => (
  // make things with RR links work
  <StaticRouter location="/">
    {children}
  </StaticRouter>
);