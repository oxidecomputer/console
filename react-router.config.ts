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
  // Splitting (on by default in v8) emits a separate clientLoader chunk per
  // route so the loader can start before the component downloads. Few of our
  // loaders can be split, and the rest leave dead placeholder chunks, so it
  // mostly adds files.
  splitRouteModules: false,
  routeDiscovery: { mode: 'initial' },
  async buildEnd({ reactRouterConfig }) {
    await externalizeSpaScripts(`${reactRouterConfig.buildDirectory}/client`)
  },
} satisfies Config
