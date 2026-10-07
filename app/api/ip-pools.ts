/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { ALL_ISH } from '~/util/consts'

import { api, q, usePrefetchedQuery } from './client'

/**
 * Unicast pools linked to the current silo. Ephemeral IPs, floating IPs, and
 * internet gateways can only use unicast pools. Use this everywhere so callers
 * share one cache entry.
 */
export const siloUnicastPoolsQ = q(api.ipPoolList, {
  query: { poolType: 'unicast', limit: ALL_ISH },
})

/** Requires `siloUnicastPoolsQ` to be prefetched in the loader */
export const useSiloUnicastPools = () => usePrefetchedQuery(siloUnicastPoolsQ).data.items
