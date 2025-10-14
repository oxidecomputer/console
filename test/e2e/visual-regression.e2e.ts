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

import { expect, test } from './utils'

test.describe('Visual Regression', { tag: '@visual' }, () => {
  test('projects list', async ({ page }) => {
    await page.goto('/projects')
    await page.getByRole('heading', { name: 'Projects' }).waitFor()
    await expect(page).toHaveScreenshot('projects-list.png', { fullPage: true })
  })

  test('instances list', async ({ page }) => {
    await page.goto('/projects/mock-project/instances')
    await page.getByRole('heading', { name: 'Instances' }).waitFor()
    await expect(page).toHaveScreenshot('instances-list.png', { fullPage: true })
  })

  test('instance detail', async ({ page }) => {
    await page.goto('/projects/mock-project/instances/db1')
    await page.getByRole('heading', { name: 'db1' }).waitFor()
    await expect(page).toHaveScreenshot('instance-detail.png', { fullPage: true })
  })

  test('create disk', async ({ page }) => {
    await page.goto('/projects/mock-project/disks-new')
    await page.getByRole('heading', { name: 'Create disk' }).waitFor()
    await expect(page).toHaveScreenshot('disks-new.png', { fullPage: true })
  })

  test('disks list', async ({ page }) => {
    await page.goto('/projects/mock-project/disks')
    await page.getByRole('heading', { name: 'Disks' }).waitFor()
    await expect(page).toHaveScreenshot('disks-list.png', { fullPage: true })
  })

  test('vpcs list', async ({ page }) => {
    await page.goto('/projects/mock-project/vpcs')
    await page.getByRole('heading', { name: 'VPCs' }).waitFor()
    await expect(page).toHaveScreenshot('vpcs-list.png', { fullPage: true })
  })

  test('snapshots list', async ({ page }) => {
    await page.goto('/projects/mock-project/snapshots')
    await page.getByRole('heading', { name: 'Snapshots' }).waitFor()
    await expect(page).toHaveScreenshot('snapshots-list.png', { fullPage: true })
  })

  test('images list', async ({ page }) => {
    await page.goto('/projects/mock-project/images')
    await page.getByRole('heading', { name: 'Images' }).waitFor()
    await expect(page).toHaveScreenshot('images-list.png', { fullPage: true })
  })

  test('silo images list', async ({ page }) => {
    await page.goto('/images')
    await page.getByRole('heading', { name: 'Silo Images' }).waitFor()
    await expect(page).toHaveScreenshot('silo-images.png', { fullPage: true })
    await page.click('role=button[name="Promote image"]')
    await expect(page).toHaveScreenshot('silo-images-promote.png', { fullPage: true })
  })

  test('silo image', async ({ page }) => {
    await page.goto('/images/arch-2022-06-01/edit')
    await page.getByRole('heading', { name: 'Silo image', exact: true }).waitFor()
    await expect(page).toHaveScreenshot('silo-image.png', { fullPage: true })
  })

  test('system utilization', async ({ page }) => {
    await page.goto('/utilization')
    await page.getByRole('heading', { name: 'Utilization' }).waitFor()
    await expect(page).toHaveScreenshot('system-utilization.png', { fullPage: true })
  })

  test('system silos list', async ({ page }) => {
    await page.goto('/system/silos')
    await page.getByRole('heading', { name: 'Silos' }).waitFor()
    await expect(page).toHaveScreenshot('system-silos.png', { fullPage: true })
  })

  test('system networking ip pools', async ({ page }) => {
    await page.goto('/system/networking/ip-pools')
    await page.getByRole('heading', { name: 'IP Pools' }).waitFor()
    await expect(page).toHaveScreenshot('system-ip-pools.png', { fullPage: true })
  })

  test('settings profile', async ({ page }) => {
    await page.goto('/settings/profile')
    await page.getByRole('heading', { name: 'Profile' }).waitFor()
    await expect(page).toHaveScreenshot('settings-profile.png', { fullPage: true })
  })

  test('login form', async ({ page }) => {
    await page.goto('/login/default-silo/local')

    await expect(page).toHaveURL(/\/login/)
    await expect(page).toHaveScreenshot('login-form.png')
  })

  test('command menu', async ({ page }) => {
    await page.keyboard.press(`ControlOrMeta+k`)
    await expect(page).toHaveScreenshot('command-menu.png', { fullPage: true })
  })
})
