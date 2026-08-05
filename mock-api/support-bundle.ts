/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as R from 'remeda'

import type { SupportBundleInfo } from '@oxide/api'

import { GiB } from '~/util/units'

import type { Json } from './json-type'

export const supportBundles: Json<SupportBundleInfo>[] = [
  {
    id: 'ccdac005-66a8-4921-9e8b-30531c359c31',
    reason_for_creation: 'Created by external API',
    state: 'active',
    time_created: new Date('2025-07-30T14:30:00Z').toISOString(),
    user_comment: 'Investigating slow instance start times',
  },
  {
    // created by fault management rather than an operator, hence the
    // diagnosis-style reason and lack of comment
    id: '7bdd4ef3-8183-46fe-9e9f-81b34bf6b2c5',
    reason_for_creation: 'Diagnosis: fan failure on sled BRM42220031',
    state: 'collecting',
    time_created: new Date('2025-08-01T09:15:00Z').toISOString(),
  },
  {
    id: 'bfc48b0c-68bb-4366-98a7-c15e0afe3a7c',
    reason_for_creation: 'Created by external API',
    reason_for_failure: 'Allocated dataset no longer exists',
    state: 'failed',
    time_created: new Date('2025-07-28T11:00:00Z').toISOString(),
  },
]

/** Zip sizes reported by the HEAD handler. Bundles not listed get 1 GiB. */
export const supportBundleSizes: Record<string, number> = {
  'ccdac005-66a8-4921-9e8b-30531c359c31': Math.floor(2.4 * GiB),
}

/**
 * Contents served by the index and per-file download handlers for any active
 * bundle. A tiny slice of a real bundle's layout, including a nested zip to
 * exercise the download-only path in the file viewer.
 */
export const supportBundleFiles: Record<string, string> = {
  'bundle_id.txt': 'ccdac005-66a8-4921-9e8b-30531c359c31',
  'meta/reason_for_creation.txt': 'Created by external API',
  'meta/report.json': JSON.stringify(
    {
      bundle: 'ccdac005-66a8-4921-9e8b-30531c359c31',
      steps: [
        { name: 'reconfigurator state', duration_ms: 132 },
        { name: 'host info: sled 0', duration_ms: 4189 },
      ],
    },
    null,
    2
  ),
  'rack/a5b3fd8a/sled/0/zpool.json': JSON.stringify({ pools: ['oxp_ccdac005'] }),
  'reconfigurator_state.json': JSON.stringify({ blueprint: 'b6034a15' }),
  'sp_task_dumps/switch_0/dump-0.zip': '',
}

/** Zip entry list in the format the real index endpoint returns: sorted names, one per line, dirs with trailing slashes */
export const supportBundleIndexText = R.pipe(
  Object.keys(supportBundleFiles),
  R.flatMap((path) => {
    const entries = [path]
    // add an explicit entry for each ancestor directory
    const segments = path.split('/')
    for (let i = 1; i < segments.length; i++) {
      entries.push(`${segments.slice(0, i).join('/')}/`)
    }
    return entries
  }),
  R.unique(),
  R.sortBy((x) => x)
).join('\n')
