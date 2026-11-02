/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { StrictMode, startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

import { startMockAPI } from './msw-mock-api'

if (process.env.SHA) {
  console.info(
    'Oxide Web Console version',
    `https://github.com/oxidecomputer/console/commits/${process.env.SHA}`
  )
}

async function hydrate() {
  // Initial route loaders must wait for the worker and its database to be ready.
  if (process.env.MSW) await startMockAPI()
  if (import.meta.env.PROD) {
    // Wait for the parser's blocking bootstrap scripts to finish before hydration.
    if (document.readyState === 'loading') {
      await new Promise<void>((resolve) => {
        document.addEventListener('DOMContentLoaded', () => resolve(), { once: true })
      })
    }
    // The build moves inline script bodies into assets to satisfy CSP. They have
    // already run; restore the empty DOM shape expected by React Router's Scripts
    // component so it can hydrate normally without executing any inline code.
    for (const script of document.querySelectorAll<HTMLScriptElement>(
      'script[data-spa-script]'
    )) {
      script.removeAttribute('src')
      script.removeAttribute('data-spa-script')
      script.textContent = ' '
    }
  }
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>
    )
  })
}

hydrate()
