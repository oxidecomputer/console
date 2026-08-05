/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'

import { bundleFileUrl, isViewable, lsBundleDir, parseBundleIndex } from './support-bundle'

const index = parseBundleIndex(
  [
    'bundle_id.txt',
    'meta/',
    'meta/reason_for_creation.txt',
    'meta/report.json',
    'rack/',
    'rack/a5b3/',
    'rack/a5b3/sled/',
    'rack/a5b3/sled/0/',
    'rack/a5b3/sled/0/zpool.json',
    'reconfigurator_state.json',
    '', // trailing newline produces an empty entry
  ].join('\n')
)

describe('parseBundleIndex', () => {
  it('drops empty lines', () => {
    expect(index).toHaveLength(10)
  })
})

describe('lsBundleDir', () => {
  it('lists the root with dirs first', () => {
    expect(lsBundleDir(index, '')).toEqual([
      { name: 'meta', path: 'meta/', isDir: true },
      { name: 'rack', path: 'rack/', isDir: true },
      { name: 'bundle_id.txt', path: 'bundle_id.txt', isDir: false },
      {
        name: 'reconfigurator_state.json',
        path: 'reconfigurator_state.json',
        isDir: false,
      },
    ])
  })

  it('lists a subdirectory', () => {
    expect(lsBundleDir(index, 'meta/')).toEqual([
      {
        name: 'reason_for_creation.txt',
        path: 'meta/reason_for_creation.txt',
        isDir: false,
      },
      { name: 'report.json', path: 'meta/report.json', isDir: false },
    ])
  })

  it('shows only the immediate child of a deep tree', () => {
    expect(lsBundleDir(index, 'rack/')).toEqual([
      { name: 'a5b3', path: 'rack/a5b3/', isDir: true },
    ])
  })

  it('derives directories even without explicit dir entries', () => {
    const noDirs = ['meta/report.json', 'bundle_id.txt']
    expect(lsBundleDir(noDirs, '')).toEqual([
      { name: 'meta', path: 'meta/', isDir: true },
      { name: 'bundle_id.txt', path: 'bundle_id.txt', isDir: false },
    ])
  })
})

it('isViewable matches text-like extensions only', () => {
  expect(isViewable('bundle_id.txt')).toBe(true)
  expect(isViewable('meta/report.json')).toBe(true)
  expect(isViewable('logs/oxz_switch/logs.zip')).toBe(false)
})

it('bundleFileUrl encodes slashes in the file path', () => {
  expect(bundleFileUrl('abc', 'meta/report.json')).toBe(
    '/experimental/v1/system/support-bundles/abc/download/meta%2Freport.json'
  )
})
