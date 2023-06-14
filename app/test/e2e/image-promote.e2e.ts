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
