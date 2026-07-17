/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/**
 * Visual regression tests for style changes
 *
 * This test file captures visual snapshots of key pages and components.
 * Use it to detect unintended visual changes when upgrading design systems,
 * CSS frameworks, or making broad styling changes.
 */

import { expect, test } from '../e2e/utils'

// set a fixed time to avoid diffs due to irrelevant time differences
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2025-10-23T12:34:56.000Z'))
  // seed Math.random so mock data (e.g. metrics charts) is deterministic
  await page.addInitScript(() => {
    let seed = 0x12345678
    Math.random = () => {
      seed |= 0
      seed = (seed + 0x6d2b79f5) | 0
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  })
})

const fullPage = { fullPage: true }

const p = '/projects/mock-project'

// Standard pages: goto URL, wait for heading, take full-page screenshot
const pages = [
  // Auth
  { name: 'device verify', url: '/device/verify', heading: 'Device Authentication' },
  { name: 'device success', url: '/device/success', heading: 'Device logged in' },

  // Settings
  { name: 'settings profile', url: '/settings/profile', heading: 'Profile' },
  { name: 'settings SSH keys', url: '/settings/ssh-keys', heading: 'SSH Keys' },
  {
    name: 'settings access tokens',
    url: '/settings/access-tokens',
    heading: 'Access Tokens',
  },

  // Silo
  { name: 'projects list', url: '/projects', heading: 'Projects' },
  {
    name: 'silo image detail',
    url: '/images/arch-2022-06-01',
    heading: 'Image details',
    exact: true,
  },
  { name: 'silo access', url: '/access', heading: 'Silo Access' },

  // Project - Instances
  { name: 'instances list', url: `${p}/instances`, heading: 'Instances' },
  { name: 'instance create', url: `${p}/instances-new`, heading: 'Create instance' },
  { name: 'instance storage tab', url: `${p}/instances/db1/storage`, heading: 'db1' },
  { name: 'instance networking tab', url: `${p}/instances/db1/networking`, heading: 'db1' },
  { name: 'instance metrics cpu', url: `${p}/instances/db1/metrics/cpu`, heading: 'db1' },
  { name: 'instance metrics disk', url: `${p}/instances/db1/metrics/disk`, heading: 'db1' },
  {
    name: 'instance metrics network',
    url: `${p}/instances/db1/metrics/network`,
    heading: 'db1',
  },
  { name: 'instance connect tab', url: `${p}/instances/db1/connect`, heading: 'db1' },
  { name: 'instance settings tab', url: `${p}/instances/db1/settings`, heading: 'db1' },

  // Project - Disks
  { name: 'disks list', url: `${p}/disks`, heading: 'Disks' },
  { name: 'create disk', url: `${p}/disks-new`, heading: 'Create disk' },

  // Project - Snapshots, Images
  { name: 'snapshots list', url: `${p}/snapshots`, heading: 'Snapshots' },
  { name: 'images list', url: `${p}/images`, heading: 'Images' },
  { name: 'image upload', url: `${p}/images-new`, heading: 'Upload image' },

  // Project - VPCs
  { name: 'vpcs list', url: `${p}/vpcs`, heading: 'VPCs' },
  {
    name: 'vpc firewall rules',
    url: `${p}/vpcs/mock-vpc/firewall-rules`,
    heading: 'mock-vpc',
  },
  { name: 'vpc subnets', url: `${p}/vpcs/mock-vpc/subnets`, heading: 'mock-vpc' },
  { name: 'vpc routers', url: `${p}/vpcs/mock-vpc/routers`, heading: 'mock-vpc' },
  {
    name: 'vpc internet gateways',
    url: `${p}/vpcs/mock-vpc/internet-gateways`,
    heading: 'mock-vpc',
  },
  {
    name: 'vpc router detail',
    url: `${p}/vpcs/mock-vpc/routers/mock-custom-router`,
    heading: 'mock-custom-router',
  },

  // Project - Networking
  { name: 'floating IPs', url: `${p}/floating-ips`, heading: 'Floating IPs' },
  { name: 'external subnets', url: `${p}/external-subnets`, heading: 'External Subnets' },

  // Project - Other
  { name: 'project access', url: `${p}/access`, heading: 'Project Access' },
  { name: 'affinity groups', url: `${p}/affinity`, heading: 'Affinity Groups' },
  {
    name: 'anti-affinity group detail',
    url: `${p}/affinity/romulus-remus`,
    heading: 'romulus-remus',
  },

  // System - Silos
  { name: 'system silos list', url: '/system/silos', heading: 'Silos' },
  { name: 'silo detail idps', url: '/system/silos/maze-war/idps', heading: 'maze-war' },
  {
    name: 'silo detail ip pools',
    url: '/system/silos/maze-war/ip-pools',
    heading: 'maze-war',
  },
  {
    name: 'silo detail subnet pools',
    url: '/system/silos/maze-war/subnet-pools',
    heading: 'maze-war',
  },
  { name: 'silo detail quotas', url: '/system/silos/maze-war/quotas', heading: 'maze-war' },
  {
    name: 'silo detail fleet roles',
    url: '/system/silos/maze-war/fleet-roles',
    heading: 'maze-war',
  },
  { name: 'silo detail scim', url: '/system/silos/maze-war/scim', heading: 'maze-war' },

  // System - Utilization
  { name: 'system utilization', url: '/system/utilization', heading: 'Utilization' },

  // System - Networking
  { name: 'system ip pools', url: '/system/networking/ip-pools', heading: 'IP Pools' },
  {
    name: 'ip pool detail',
    url: '/system/networking/ip-pools/ip-pool-1',
    heading: 'ip-pool-1',
  },
  {
    name: 'ip pool silos tab',
    url: '/system/networking/ip-pools/ip-pool-1?tab=silos',
    heading: 'ip-pool-1',
  },
  {
    name: 'system subnet pools',
    url: '/system/networking/subnet-pools',
    heading: 'Subnet Pools',
  },
  {
    name: 'subnet pool detail',
    url: '/system/networking/subnet-pools/default-v4-subnet-pool',
    heading: 'default-v4-subnet-pool',
  },
  {
    name: 'subnet pool silos tab',
    url: '/system/networking/subnet-pools/default-v4-subnet-pool?tab=silos',
    heading: 'default-v4-subnet-pool',
  },

  // System - Inventory
  { name: 'inventory sleds', url: '/system/inventory/sleds', heading: 'Inventory' },
  { name: 'inventory disks', url: '/system/inventory/disks', heading: 'Inventory' },
  {
    name: 'sled instances',
    url: '/system/inventory/sleds/c2519937-44a4-493b-9b38-5c337c597d08/instances',
    heading: 'Sled',
  },

  // System - Update & Access
  { name: 'system update', url: '/system/update', heading: 'System Update' },
  { name: 'fleet access', url: '/system/access', heading: 'Fleet Access' },

  // Error
  { name: 'not found', url: '/nonexistent', heading: 'Page not found' },
]

test.describe('Visual Regression', { tag: '@visual' }, () => {
  for (const { name, url, heading, exact } of pages) {
    const screenshot = name.replaceAll(' ', '-') + '.png'
    test(name, async ({ page }) => {
      await page.goto(url, { waitUntil: 'networkidle' })
      await expect(page.getByRole('heading', { name: heading, exact })).toBeVisible()
      await expect(page).toHaveScreenshot(screenshot, fullPage)
    })
  }

  // Special cases that don't fit the standard pattern

  test('login form', async ({ page }) => {
    await page.goto('/login/default-silo/local', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/\/login/)
    await expect(page).toHaveScreenshot('login-form.png')
  })

  test('silo images', async ({ page }) => {
    await page.goto('/images', { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: 'Silo Images' })).toBeVisible()
    await expect(page).toHaveScreenshot('silo-images.png', fullPage)
    await page.getByRole('button', { name: 'Promote image' }).click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('silo-images-promote.png', fullPage)
  })

  test('saml login', async ({ page }) => {
    await page.goto('/login/default-silo/saml/mock-idp', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/\/login/)
    await expect(page).toHaveScreenshot('saml-login.png')
  })

  test('serial console', async ({ page }) => {
    await page.goto(`${p}/instances/db1/serial-console`, { waitUntil: 'networkidle' })
    await expect(page.getByText('Serial Console')).toBeVisible()
    await expect(page).toHaveScreenshot('serial-console.png', fullPage)
  })

  test('command menu', async ({ page }) => {
    await page.keyboard.press(`ControlOrMeta+k`)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('command-menu.png', fullPage)
  })

  // Utilization pages render charts and include the refetch interval picker —
  // wait for the chart, then mask the refresh button so the spinner state
  // doesn't cause flaky diffs.
  test('silo utilization', async ({ page }) => {
    await page.goto('/utilization', { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: 'Utilization' })).toBeVisible()
    await expect(page.locator('figure').first()).toBeVisible()
    await expect(page).toHaveScreenshot('silo-utilization.png', {
      fullPage: true,
      mask: [page.getByTestId('refetch-interval-refresh')],
      maskColor: '#0b0e14',
    })
  })

  test('system utilization metrics tab', async ({ page }) => {
    await page.goto('/system/utilization?tab=metrics', { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: 'Utilization' })).toBeVisible()
    await expect(page.locator('figure').first()).toBeVisible()
    await expect(page).toHaveScreenshot('system-utilization-metrics-tab.png', {
      fullPage: true,
      mask: [page.getByTestId('refetch-interval-refresh')],
      maskColor: '#0b0e14',
    })
  })
})
