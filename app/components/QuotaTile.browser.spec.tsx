/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { GiB, TiB } from '~/util/units'

import { QuotaTiles } from './QuotaTile'

test('shows a storage overage smaller than the displayed TiB precision', async () => {
  const screen = await render(
    <QuotaTiles
      provisioned={{ cpus: 0, memory: 0, storage: TiB + GiB }}
      allocated={{ cpus: 0, memory: 0, storage: TiB }}
      storageUnit="TiB"
      showBar
    />
  )
  const storage = screen.getByRole('region', { name: 'Storage' })
  await expect.element(storage.getByText('Over quota')).toBeVisible()
  await expect.element(storage.getByText('1 GiB', { exact: true })).toBeVisible()
  await expect.element(storage.getByText('100.1%', { exact: true })).toBeVisible()
})

test('shows amounts under 1 TiB in a smaller unit', async () => {
  const screen = await render(
    <QuotaTiles
      provisioned={{ cpus: 0, memory: 0, storage: TiB - 5.5 * GiB }}
      allocated={{ cpus: 0, memory: 0, storage: TiB }}
      storageUnit="TiB"
      showBar
    />
  )
  const storage = screen.getByRole('region', { name: 'Storage' })
  await expect.element(storage.getByText('1,018.5 GiB', { exact: true })).toBeVisible()
  await expect.element(storage.getByText('Available')).toBeVisible()
  // 5.5 GiB would round to 0.01 TiB, which is nearly double
  await expect.element(storage.getByText('5.5 GiB', { exact: true })).toBeVisible()
})
