import { test } from '@playwright/test'

import { expect, expectNotVisible, expectVisible } from './utils'

test('can promote an image from silo', async ({ page }) => {
  await page.goto('/images')
  await page.click('role=button[name="Promote image"]')

  // The image we want to promote isn't already there
  await expectNotVisible(page, ['role=cell[name="image-1"]'])

  // Listboxes are visible
  await expect(page.locator(`text="Filter images by project"`)).toBeVisible()
  await expect(page.locator(`text="Select an image"`)).toBeVisible()

  // Notice is visible
  await expect(
    page.locator(
      `text="Once an image has been promoted it is visible to all projects in a silo"`
    )
  ).toBeVisible()

  // Select a project
  await page.locator('role=button[name*="Project"]').click()
  await page.locator('role=option[name="other-project"]').click()

  // Should have no items
  // and buttons should be disabled
  await expect(page.locator(`text="No items"`)).toBeVisible()
  await expect(page.locator('role=button[name*="Image"]')).toBeDisabled()

  // Select the other project
  await page.locator('role=button[name*="Project"]').click()
  await page.locator('role=option[name="mock-project"]').click()

  // Select an image in that project
  const imageListbox = page.locator('role=button[name*="Image"]')
  await expect(imageListbox).toBeEnabled({ timeout: 5000 })
  await imageListbox.click()
  await page.locator('role=option >> text="image-1"').click()
  await page.locator('role=button[name="Promote"]').click()

  // Check it was promoted successfully
  await expectVisible(page, ['text="Image has been promoted"'])
  await expectVisible(page, ['role=cell[name="image-1"]'])
})

test('can promote an image from project', async ({ page }) => {
  await page.goto('/projects/mock-project/images')

  // Click on the row actions button for image-2 and open promote modal
  await page
    .locator('role=row', { hasText: 'image-2' })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Promote image"]')

  // Modal is visible
  await expect(page.getByText('Are you sure you want to promote image-2?')).toBeVisible()
  await expect(
    page.locator(
      `text="Once an image has been promoted it is visible to all projects in a silo"`
    )
  ).toBeVisible()

  // Promote image and check it was successful
  await page.locator('role=button[name="Promote"]').click()
  await expectVisible(page, ['text="Image has been promoted"'])
  await expectNotVisible(page, ['role=cell[name="image-2"]'])

  await page.click('role=link[name="View silo images"]')
  await expectVisible(page, ['role=cell[name="image-2"]'])
})

test('can copy an image ID to clipboard', async ({ page }) => {
  await page.goto('/images')

  await page
    .locator('role=row', { hasText: 'ubuntu-22-04' })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Copy ID"]')

  expect(await page.evaluate(() => navigator.clipboard.readText())).toEqual(
    'ae46ddf5-a8d5-40fa-bcda-fcac606e3f9b'
  )

  await page.goto('/projects/mock-project/images')

  await page
    .locator('role=row', { hasText: 'image-4' })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Copy ID"]')

  expect(await page.evaluate(() => navigator.clipboard.readText())).toEqual(
    'd150b87d-eb20-49d2-8b56-ff5564670e8c'
  )
})

test('can demote an image from silo', async ({ page }) => {
  await page.goto('/images')

  await page
    .locator('role=row', { hasText: 'arch-2022-06-01' })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Demote image"]')

  // Notice is visible
  await expect(
    page.locator(
      `text="Once an image has been demoted it is only visible to the project that it is demoted into. This will not affect disks already created with the image."`
    )
  ).toBeVisible()

  // Correct image is selected
  await expect(page.getByText('Demoting: arch-2022-06-01')).toBeVisible()

  // Cannot demote without first selecting a project
  await page.locator('role=button[name="Demote"]').click()
  await expect(
    page.getByRole('dialog', { name: 'Demote image' }).getByText('Project is required')
  ).toBeVisible()

  // Select an project to demote it
  const imageListbox = page.locator('role=button[name*="Project"]')
  await expect(imageListbox).toBeEnabled({ timeout: 5000 })
  await imageListbox.click()
  await page.locator('role=option >> text="mock-project"').click()
  await page.locator('role=button[name="Demote"]').click()

  // Promote image and check it was successful
  await expectVisible(page, ['text="Image has been demoted"'])
  await expectNotVisible(page, ['role=cell[name="arch-2022-06-01"]'])

  await page.click('role=link[name="View images in mock-project"]')
  await expectVisible(page, ['role=cell[name="arch-2022-06-01"]'])
})
