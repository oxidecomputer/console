/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { SupportBundleInfo } from '@oxide/api'

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
    // verbatim FAILURE_REASON_NO_DATASET from omicron
    reason_for_failure: 'Allocated dataset no longer exists',
    state: 'failed',
    time_created: new Date('2025-07-28T11:00:00Z').toISOString(),
  },
]

/**
 * Served by the index handler for any active bundle: zip entry names in the
 * format the real endpoint returns — sorted, one per line, directories with
 * trailing slashes. A tiny slice of a real bundle's layout. 8 files.
 */
export const supportBundleIndexText = [
  'bundle_id.txt',
  'ereports/',
  'ereports/9130000019-BRM42220031/',
  'ereports/9130000019-BRM42220031/3f7d938a-71b0-4707-b020-ba05526e84ee/',
  'ereports/9130000019-BRM42220031/3f7d938a-71b0-4707-b020-ba05526e84ee/0x1.json',
  'ereports/9130000019-BRM42220031/3f7d938a-71b0-4707-b020-ba05526e84ee/0x2.json',
  'meta/',
  'meta/reason_for_creation.txt',
  'meta/report.json',
  'rack/',
  'rack/a5b3fd8a/',
  'rack/a5b3fd8a/sled/',
  'rack/a5b3fd8a/sled/0/',
  'rack/a5b3fd8a/sled/0/zpool.json',
  'reconfigurator_state.json',
  'sp_task_dumps/',
  'sp_task_dumps/switch_0/',
  'sp_task_dumps/switch_0/dump-0.zip',
].join('\n')

// Fake `Content-Length` for the HEAD handler
export const SUPPORT_BUNDLE_SIZE = 2_576_980_378
