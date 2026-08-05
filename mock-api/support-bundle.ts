/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as R from 'remeda'

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
    reason_for_failure: 'Allocated dataset no longer exists',
    state: 'failed',
    time_created: new Date('2025-07-28T11:00:00Z').toISOString(),
  },
]

/**
 * One ereport JSON body as the collector writes it: the `Ereport` struct with
 * its id, data, and reporter fields flattened to the top level, serialized
 * compactly. Stored at ereports/{part}-{serial}/{restart_id}/{ena}.json, with
 * the ENA hex-formatted in the filename but numeric in the body.
 * https://github.com/oxidecomputer/omicron/blob/f0c48d9/support-bundle-collection/src/steps/ereports.rs#L133
 */
const ereport = (
  restartId: string,
  ena: number,
  cls: string,
  report: Record<string, string | number | boolean>,
  reporter: Record<string, string | number>,
  serialNumber = 'BRM42220031',
  partNumber = '9130000019'
) =>
  JSON.stringify({
    restart_id: restartId,
    ena,
    time_collected: '2025-07-29T18:04:12.331829Z',
    collector_id: '10a7c394-5c79-4bba-b295-81179efc3086',
    serial_number: serialNumber,
    part_number: partNumber,
    class: cls,
    ...report,
    ...reporter,
    marked_seen_in: null,
  })

const sledSpRestart = '3f7d938a-71b0-4707-b020-ba05526e84ee'
const switchSpRestart = '89b5774e-31f6-4137-bf85-037f1b4a4ba4'
const hostOsRestart = 'e4888dc8-69e2-499d-a8e3-9be74d4950ed'

/**
 * Contents served by the index and per-file download handlers for any active
 * bundle. A tiny slice of a real bundle's layout, including a nested zip to
 * exercise the download-only path in the file viewer.
 */
export const supportBundleFiles: Record<string, string> = {
  'bundle_id.txt': 'ccdac005-66a8-4921-9e8b-30531c359c31',
  [`ereports/9130000019-BRM42220031/${sledSpRestart}/0x1.json`]: ereport(
    sledSpRestart,
    1,
    'ereport.sp.fan.speed_out_of_range',
    { fan: 2, rpm: 2113, threshold_rpm: 2500 },
    { reporter: 'Sp', sp_type: 'sled', slot: 8 }
  ),
  [`ereports/9130000019-BRM42220031/${sledSpRestart}/0x2.json`]: ereport(
    sledSpRestart,
    2,
    'ereport.sp.thermal.sensor_read_timeout',
    { sensor: 't_dimm_b0' },
    { reporter: 'Sp', sp_type: 'sled', slot: 8 }
  ),
  // host OS ereport from the same sled, so this board dir has two restart dirs
  [`ereports/9130000019-BRM42220031/${hostOsRestart}/0x1.json`]: ereport(
    hostOsRestart,
    1,
    'ereport.host.zfs.checksum_errors',
    { pool: 'oxp_ccdac005', errors: 3 },
    { reporter: 'HostOs', sled: '6e06fb3d-b0cf-4236-a736-18875c020a01', slot: 8 }
  ),
  [`ereports/9130000006-BRM41000555/${switchSpRestart}/0x1.json`]: ereport(
    switchSpRestart,
    1,
    'ereport.sp.power.rail_fault',
    { rail: 'v12_sys_a2' },
    { reporter: 'Sp', sp_type: 'switch', slot: 1 },
    'BRM41000555',
    '9130000006'
  ),
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
