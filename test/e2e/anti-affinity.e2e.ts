/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test } from '@playwright/test'

import { clickRowAction, expectRowVisible } from './utils'

test('can nav to Affinity from /', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('table').getByRole('link', { name: 'mock-project' }).click()
  await page.getByRole('link', { name: 'Affinity' }).click()

  await expectRowVisible(page.getByRole('table'), {
    name: 'romulus-remus',
    type: 'anti-affinity',
    policy: 'fail',
    members: '2',
  })

  // click the anti-affinity group name cell to go to the view page
  await page.getByRole('link', { name: 'romulus-remus' }).click()

  await expect(page.getByRole('heading', { name: 'romulus-remus' })).toBeVisible()
  await expect(page).toHaveURL('/projects/mock-project/affinity/romulus-remus')
  await expect(page).toHaveTitle(
    'romulus-remus / Affinity / mock-project / Projects / Oxide Console'
  )
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
  await page.getByRole('button', { name: 'Add instance' }).click()
  await expect(page.getByRole('heading', { name: 'Add instance to group' })).toBeVisible()
  await page.getByRole('combobox', { name: 'Instance' }).fill('db1')
  await page.getByRole('option', { name: 'db1' }).click()
  await page.getByRole('button', { name: 'Add to group' }).click()

  const cell = page.getByRole('cell', { name: 'db1' })
  await expect(cell).toBeVisible()

  // remove the instance from the group
  await clickRowAction(page, 'db1', 'Remove from group')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(cell).toBeHidden()

  // expect empty message
  await expect(page.getByText('No anti-affinity group members')).toBeVisible()
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
