import { test, expect } from '@playwright/test'
import { forEach } from 'app/util/e2e'

// this could easily be done as a testing-lib test but I want it in a real table

test('Row select works as expected', async ({ page }) => {
  // SETUP

  const headCheckbox = page.locator('thead >> role=checkbox')
  const headMixed = page.locator('thead >> role=checkbox[checked="mixed"]')

  const expectHeadMixed = async () => {
    await expect(headCheckbox).not.toBeChecked()
    await expect(headMixed).toHaveCount(1)
  }
  const expectHeadNotMixed = async () => {
    await expect(headCheckbox).not.toBeChecked()
    await expect(headMixed).toHaveCount(0)
  }

  const bodyCheckboxes = page.locator('tbody >> role=checkbox')

  const expectRowsAllChecked = () =>
    forEach(bodyCheckboxes, (ch) => expect(ch).toBeChecked())
  const expectRowsAllUnchecked = () =>
    forEach(bodyCheckboxes, (ch) => expect(ch).not.toBeChecked())

  // ACTUAL TEST

  await page.goto('/orgs/maze-war/projects/mock-project/vpcs/mock-vpc?tab=firewall-rules')

  // baseline empty state
  await expect(headCheckbox).toHaveCount(1)
  await expect(headCheckbox).not.toBeChecked()
  await expectHeadNotMixed()

  await expect(bodyCheckboxes).toHaveCount(4)
  await expectRowsAllUnchecked()

  // check first row, header is now mixed
  await bodyCheckboxes.first().check()
  await expectHeadMixed()

  // uncheck first row, header goes back to empty
  await bodyCheckboxes.first().uncheck()
  await expectHeadNotMixed()

  // can also uncheck the row by checking and unchecking the header checkbox
  await bodyCheckboxes.first().check()
  await headCheckbox.click() // first click selects all
  await expectRowsAllChecked()
  await headCheckbox.click() // second click unselects all
  await expectRowsAllUnchecked()

  // check 3 checkboxes, header stays mixed
  await bodyCheckboxes.nth(0).check()
  await bodyCheckboxes.nth(1).check()
  await bodyCheckboxes.nth(2).check()
  await expectHeadMixed()

  // check the 4th and it switches to checked
  await bodyCheckboxes.nth(3).check()
  await expect(headCheckbox).toBeChecked()
})
