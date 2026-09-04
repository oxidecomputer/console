/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { defineConfig } from 'vite'

import vercelConfig from './vercel.json'

// Preview the deployable static files without the framework's prerender server.
export default defineConfig({
  // The React Router plugin sets this in the main config, but this config
  // leaves the plugin out, so preview would otherwise serve Vite's default dist
  build: { outDir: 'build/client' },
  preview: {
    headers: Object.fromEntries(
      vercelConfig.headers[0].headers.map(({ key, value }) => [key, value])
    ),
  },
})
