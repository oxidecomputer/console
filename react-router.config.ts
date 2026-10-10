/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Config } from '@react-router/dev/config'

import { externalizeSpaScripts } from './tools/externalize-spa-scripts'

export default {
  ssr: false,
  routeDiscovery: { mode: 'initial' },
  async buildEnd({ reactRouterConfig }) {
    await externalizeSpaScripts(`${reactRouterConfig.buildDirectory}/client`)
  },
} satisfies Config
