/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { test } from '@playwright/test'

import {
  clickRowAction,
  clipboardText,
  expect,
  expectNotVisible,
  expectVisible,
  getPageAsUser,
  selectOption,
} from './utils'

test('can promote an image from silo', async ({ page }) => {
  await page.goto('/images')
  await page.click('role=button[name="Promote image"]')

  // The image we want to promote isn't already there
  await expectNotVisible(page, ['role=cell[name="image-1"]'])

  // Listboxes are visible
  await expect(page.getByPlaceholder('Select a project')).toBeVisible()
  // have to use a locator here because the disabled button needs to be handled differently
  await expect(page.locator(`text="Select an image"`)).toBeDisabled()

  // Notice is visible
  await expect(page.getByText('visible to all projects')).toBeVisible()

  // Select a project
  await selectOption(page, 'Project', 'other-project')

  // Should have no items and dropdown should be disabled
  await expect(page.locator(`text="No items"`)).toBeDisabled()

  // Select the other project
  // this blurring should not be necessary, but it's blocking the test otherwise
  await page.getByRole('combobox', { name: 'Project' }).blur()
  await page.getByRole('combobox', { name: 'Project' }).click()
  await page.getByRole('option', { name: 'mock-project' }).click()

  // Select an image in that project
  const projectListbox = page.locator('role=button[name*="Image"]')
  await expect(projectListbox).toBeEnabled()
  await projectListbox.click()
  await page.locator('role=option >> text="image-1"').click()
  await page.locator('role=button[name="Promote"]').click()

  // Check it was promoted successfully
  await expectVisible(page, ['text="image-1 has been promoted"'])
  await expectVisible(page, ['role=cell[name="image-1"]'])
})

test('can promote an image from project', async ({ page }) => {
  await page.goto('/projects/mock-project/images')

  // Click on the row actions button for image-2 and open promote modal
  await clickRowAction(page, 'image-2', 'Promote')

  // Modal is visible
  await expect(page.getByText('Are you sure you want to promote image-2?')).toBeVisible()
  await expect(page.getByText('visible to all projects')).toBeVisible()

  // Promote image and check it was successful
  await page.locator('role=button[name="Promote"]').click()
  await expectVisible(page, ['text="image-2 has been promoted"'])
  await expectNotVisible(page, ['role=cell[name="image-2"]'])

  await page.click('role=link[name="View silo images"]')
  await expectVisible(page, ['role=cell[name="image-2"]'])
})

test('can copy an image ID to clipboard', async ({ page, browserName }) => {
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(
    browserName === 'webkit',
    'navigator.clipboard.readText() works locally in Safari but not in CI.'
  )

  await page.goto('/images')
  await clickRowAction(page, 'ubuntu-22-04', 'Copy ID')
  expect(await clipboardText(page)).toEqual('ae46ddf5-a8d5-40fa-bcda-fcac606e3f9b')

  await page.goto('/projects/mock-project/images')
  await clickRowAction(page, 'image-4', 'Copy ID')
  expect(await clipboardText(page)).toEqual('d150b87d-eb20-49d2-8b56-ff5564670e8c')
})

test('can demote an image from silo', async ({ page }) => {
  await page.goto('/images')

  await clickRowAction(page, 'arch-2022-06-01', 'Demote')

  // Notice is visible
  await expect(page.getByText('only visible to the project')).toBeVisible()

  // Correct image is selected
  await expect(page.getByText('Demoting: arch-2022-06-01')).toBeVisible()

  // Cannot demote without first selecting a project
  await page.getByRole('button', { name: 'Demote' }).click()
  await expect(
    page.getByRole('dialog', { name: 'Demote' }).getByText('Project is required')
  ).toBeVisible()

  await page.getByRole('combobox', { name: 'Project' }).click()
  await page.getByRole('option', { name: 'mock-project' }).click()
  await page.getByRole('button', { name: 'Demote' }).click()

  // Promote image and check it was successful
  await expectVisible(page, ['text="arch-2022-06-01 has been demoted"'])
  await expectNotVisible(page, ['role=cell[name="arch-2022-06-01"]'])

  await page.click('role=link[name="View images in mock-project"]')
  await expectVisible(page, ['role=cell[name="arch-2022-06-01"]'])
})

test('can delete an image from a project', async ({ page }) => {
  await page.goto('/projects/mock-project/images')

  const cell = page.getByRole('cell', { name: 'image-3' })
  await expect(cell).toBeVisible()

  await clickRowAction(page, 'image-3', 'Delete')
  const spinner = page.getByRole('dialog').getByLabel('Spinner')
  await expect(spinner).toBeHidden()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(spinner).toBeVisible()

  // Check deletion was successful
  await expect(page.getByText('image-3 has been deleted', { exact: true })).toBeVisible()
  await expect(cell).toBeHidden()
  await expect(spinner).toBeHidden()
})

test('can delete an image from a silo', async ({ page }) => {
  await page.goto('/images')

  const cell = page.getByRole('cell', { name: 'ubuntu-20-04' })
  await expect(cell).toBeVisible()

  await clickRowAction(page, 'ubuntu-20-04', 'Delete')
  const spinner = page.getByRole('dialog').getByLabel('Spinner')
  await expect(spinner).toBeHidden()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(spinner).toBeVisible()

  // Check deletion was successful
  await expect(
    page.getByText('ubuntu-20-04 has been deleted', { exact: true })
  ).toBeVisible()
  await expect(cell).toBeHidden()
  await expect(spinner).toBeHidden()
})

// this is to some extent a test of our mock server implementation, but I want
// to check the error handling as well because we expect people to run into this
test("Silo viewer can't delete silo image", async ({ browser }) => {
  const page = await getPageAsUser(browser, 'Simone de Beauvoir')

  await page.goto('/images')

  const cell = page.getByRole('cell', { name: 'ubuntu-20-04' })
  await expect(cell).toBeVisible()

  await clickRowAction(page, 'ubuntu-20-04', 'Delete')
  const spinner = page.getByRole('dialog').getByLabel('Spinner')
  await expect(spinner).toBeHidden()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(spinner).toBeVisible()

  // Check deletion was successful
  await expect(page.getByText('Could not delete resource', { exact: true })).toBeVisible()
  await expect(cell).toBeVisible()
  await expect(spinner).toBeHidden()
})
