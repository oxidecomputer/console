import { test } from '@playwright/test'

import { expectNotVisible, expectVisible } from 'app/test/e2e'

test.beforeEach(async ({ page }) => {
  await page.goto('/orgs/maze-war/projects/mock-project')
})

test('Click through instance page', async ({ page }) => {
  await expectVisible(page, ['role=heading[name*="Instances"]', 'role=cell[name="db1"]'])

  await page.click('role=link[name="db1"]')
  await expectVisible(page, [
    'role=heading[name*=db1]',
    'role=tab[name="Storage"]',
    'role=tab[name="Metrics"]',
    'role=tab[name="Network Interfaces"]',
    'role=table[name="Boot disk"] >> role=cell[name="disk-1"]',
    'role=table[name="Attached disks"] >> role=cell[name="disk-2"]',
    // buttons disabled while instance is running
    'role=button[name="Create new disk"][disabled]',
    'role=button[name="Attach existing disk"][disabled]',
    // TODO: assert minitable contents
  ])
  await expectNotVisible(page, ['role=cell[name="disk-3"]'])
})

test('Click through snapshots page', async ({ page }) => {
  await page.click('role=link[name*="Snapshots"]')
  await expectVisible(page, [
    'role=heading[name*="Snapshots"]',
    'role=cell[name="snapshot-1"]',
    'role=cell[name="snapshot-2"]',
    'role=cell[name="snapshot-3"]',
    'role=cell[name="snapshot-4"]',
  ])
})

test('Click through disks page', async ({ page }) => {
  await page.click('role=link[name*="Disks"]')
  await expectVisible(page, [
    'role=heading[name*="Disks"]',
    'role=cell[name="disk-1"]',
    'role=cell[name="disk-2"]',
    'role=cell[name="disk-3"]',
    'role=cell[name="disk-4"]',
  ])
  await page.click('role=cell[name="db1"] >> role=link')
  await expectVisible(page, ["role=heading[name*='db1']"])
  await page.goBack()

  // TODO: assert that disks 1-3 are attached and 4 is not

  // Create disk form
  await page.click('role=link[name="New Disk"]')
  await expectVisible(page, [
    'role=heading[name*="Create Disk"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=radiogroup[name="Block size (Bytes)"]',
    'role=spinbutton[name="Size (GiB)"]',
    'role=button[name="Create Disk"]',
  ])
  await page.goBack()

  // Test pagination
  await page.click('role=button[name="next"]')
  await expectVisible(page, ['role=heading[name*="Disks"]', 'role=cell[name="disk-11"]'])
  await page.click('role=button[name*="prev"]')
  await expectVisible(page, [
    'role=heading[name*="Disks"]',
    'role=cell[name="disk-1"]',
    'role=cell[name="disk-2"]',
    'role=cell[name="disk-3"]',
    'role=cell[name="disk-4"]',
  ])
})

test.skip('Click through access & IAM', async ({ page }) => {
  await page.click('role=link[name*="Access & IAM"]')
  // not implemented
})

test('Click through images', async ({ page }) => {
  await page.click('role=link[name*="Images"]')
  await expectVisible(page, [
    'role=heading[name*="Images"]',
    'role=cell[name="image-1"]',
    'role=cell[name="image-2"]',
    'role=cell[name="image-3"]',
    'role=cell[name="image-4"]',
  ])
})
