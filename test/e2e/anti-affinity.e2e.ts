/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test } from '@playwright/test'

import { clickRowAction, closeToast, expectRowVisible } from './utils'

test('can nav to Affinity from /', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('table').getByRole('link', { name: 'mock-project' }).click()
  await page.getByRole('link', { name: 'Affinity' }).click()

  await expectRowVisible(page.getByRole('table'), {
    name: 'romulus-remus',
    type: 'anti-affinity',
    Policy: 'fail',
    instances: '2',
  })

  // click the anti-affinity group name cell to go to the view page
  await page.getByRole('link', { name: 'romulus-remus' }).click()

  await expect(page.getByRole('heading', { name: 'romulus-remus' })).toBeVisible()
  await expect(page).toHaveURL('/projects/mock-project/affinity/romulus-remus')
  await expect(page).toHaveTitle(
    'romulus-remus / Affinity Groups / mock-project / Projects / Oxide Console'
  )

  // click through to instance
  await page.getByRole('link', { name: 'db1' }).click()
  await expect(page).toHaveURL('/projects/mock-project/instances/db1/settings')
})

test('can add a new anti-affinity group', async ({ page }) => {
  await page.goto('/projects/mock-project/affinity')
  await page.getByRole('link', { name: 'New group' }).click()
  await expect(page).toHaveURL('/projects/mock-project/affinity-new')
  await expect(page.getByRole('heading', { name: 'Add anti-affinity group' })).toBeVisible()

  // fill out the form
  await page.getByLabel('Name').fill('new-anti-affinity-group')
  await page
    .getByRole('textbox', { name: 'Description' })
    .fill('this is a new anti-affinity group')
  await page.getByRole('radio', { name: 'Fail' }).click()

  // submit the form
  await page.getByRole('button', { name: 'Add group' }).click()

  // check that we are on the view page for the new anti-affinity group
  await expect(page).toHaveURL('/projects/mock-project/affinity/new-anti-affinity-group')

  // add a member to the new anti-affinity group
  const addInstanceButton = page.getByRole('button', { name: 'Add instance' })
  const addInstanceModal = page.getByRole('dialog', { name: 'Add instance to group' })
  const instanceCombobox = page.getByRole('combobox', { name: 'Instance' })
  const modalAddButton = page.getByRole('button', { name: 'Add to group' })

  // open modal and pick instance
  await addInstanceButton.click()
  await expect(addInstanceModal).toBeVisible()
  await instanceCombobox.fill('db1')
  await page.getByRole('option', { name: 'db1' }).click()
  await expect(instanceCombobox).toHaveValue('db1')

  // close and reopen the modal to make sure the field clears
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(addInstanceModal).toBeHidden()
  await addInstanceButton.click()
  await expect(instanceCombobox).toHaveValue('')
  await page.getByRole('option', { name: 'db1' }).click()
  // the submit button should be disabled
  await expect(modalAddButton).toBeDisabled()

  // go disable db1
  await page.getByRole('button', { name: 'Cancel' }).click()
  await page.getByRole('link', { name: 'Instances' }).click()
  clickRowAction(page, 'db1', 'Stop')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectRowVisible(page.getByRole('table'), {
    name: 'db1',
    state: expect.stringContaining('stopped'),
  })

  // go back to the anti-affinity group and add the instance
  await page.getByRole('link', { name: 'Affinity' }).click()
  await page.getByRole('link', { name: 'new-anti-affinity-group' }).click()
  await addInstanceButton.click()
  await expect(addInstanceModal).toBeVisible()
  await instanceCombobox.fill('db1')
  await page.getByRole('option', { name: 'db1' }).click()
  await expect(instanceCombobox).toHaveValue('db1')
  // the submit button should be enabled
  await modalAddButton.click()

  const cell = page.getByRole('cell', { name: 'db1' })
  await expect(cell).toBeVisible()

  // remove the instance from the group
  await clickRowAction(page, 'db1', 'Remove from group')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(cell).toBeHidden()

  // expect empty message
  await expect(page.getByText('No group members')).toBeVisible()
})

// edit an anti-affinity group from the view page
test('can edit an anti-affinity group', async ({ page }) => {
  await page.goto('/projects/mock-project/affinity/romulus-remus')
  await page.getByRole('button', { name: 'Anti-affinity group actions' }).click()
  await page.getByRole('menuitem', { name: 'Edit' }).click()

  // can see Add anti-affinity group header
  await expect(
    page.getByRole('heading', { name: 'Edit anti-affinity group' })
  ).toBeVisible()

  // change the name to romulus-remus-2
  await page.getByLabel('Name').fill('romulus-remus-2')
  await page.getByRole('button', { name: 'Edit group' }).click()
  await expect(page).toHaveURL('/projects/mock-project/affinity/romulus-remus-2')
  await expect(page.getByRole('heading', { name: 'romulus-remus-2' })).toBeVisible()
})

// delete an anti-affinity group
test('can delete an anti-affinity group', async ({ page }) => {
  await page.goto('/projects/mock-project/affinity')
  await clickRowAction(page, 'set-osiris', 'Delete')

  await expect(
    page.getByRole('heading', { name: 'Delete anti-affinity group' })
  ).toBeVisible()

  // confirm the deletion
  await page.getByRole('button', { name: 'Confirm' }).click()

  // check that we are back on the affinity page
  await expect(page).toHaveURL('/projects/mock-project/affinity')

  // can't see set-osiris in the table
  await expect(page.getByRole('table').getByText('set-osiris')).toBeHidden()

  // can create a new anti-affinity group with the same name
  await page.getByRole('link', { name: 'New group' }).click()
  await expect(page).toHaveURL('/projects/mock-project/affinity-new')
  await expect(page.getByRole('heading', { name: 'Add anti-affinity group' })).toBeVisible()
  await page.getByLabel('Name').fill('set-osiris')
  await page
    .getByRole('textbox', { name: 'Description' })
    .fill('this is a new anti-affinity group')
  await page.getByRole('radio', { name: 'Fail' }).click()
  await page.getByRole('button', { name: 'Add group' }).click()

  await expect(page).toHaveURL('/projects/mock-project/affinity/set-osiris')
  await expect(page.getByRole('heading', { name: 'set-osiris' })).toBeVisible()

  // click on Affinity in crumbs
  await page.getByRole('link', { name: 'Affinity' }).first().click()
  await expect(page).toHaveURL('/projects/mock-project/affinity')
  // check that we can see the new anti-affinity group in the table
  await expect(page.getByRole('table').getByText('set-osiris')).toBeVisible()
})

test('can delete anti-affinity group from detail page', async ({ page }) => {
  await page.goto('/projects/mock-project/affinity/romulus-remus')

  const modal = page.getByRole('dialog', { name: 'Confirm delete' })
  await expect(modal).toBeHidden()

  await page.getByLabel('Anti-affinity group actions').click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()

  await expect(modal).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()

  // modal closes, row is gone
  await expect(modal).toBeHidden()
  await closeToast(page)
  await expect(page).toHaveURL('/projects/mock-project/affinity')
  await expectRowVisible(page.getByRole('table'), { name: 'set-osiris' })
  await expect(page.getByRole('cell', { name: 'romulus-remus' })).toBeHidden()
})
