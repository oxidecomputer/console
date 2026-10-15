/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { page, userEvent } from 'vitest/browser'

import { TextField } from '~/components/form/fields/TextField'

import { FilterPopover } from './FilterPopover'

type Filters = { name: string; owner: string; types: string[] }

function Harness() {
  const defaultValues = { name: '', owner: '', types: [] }
  const [applied, setApplied] = useState<Filters>(defaultValues)
  return (
    <>
      <FilterPopover
        isFetching={false}
        resetFieldValues={defaultValues}
        lastApplied={applied}
        handleSubmit={setApplied}
        pluralFilteredItemName="widgets"
      >
        {(form) => (
          <>
            <TextField
              name="name"
              label="Name"
              control={form.control}
              validate={(value) => (value === 'bad' ? 'No bad names' : undefined)}
            />
            <TextField name="owner" label="Owner" control={form.control} />
            <button
              type="button"
              onClick={() => setApplied((prev) => ({ ...prev, types: ['disk'] }))}
            >
              Apply type filter
            </button>
          </>
        )}
      </FilterPopover>
      <output aria-label="Applied name">{applied.name}</output>
    </>
  )
}

const filterButton = () => page.getByRole('button', { name: /^Filter widgets/ })
const form = () => page.getByRole('form', { name: 'Filter widgets' })
const resetButton = () => page.getByRole('button', { name: 'Reset' })
const nameField = () => page.getByRole('textbox', { name: 'Name' })
const applyButton = () => page.getByRole('button', { name: 'Apply' })
const appliedName = () => page.getByRole('status', { name: 'Applied name' })

test('badge counts applied filters', async () => {
  await render(<Harness />)
  const noneApplied = page.getByRole('button', { name: 'Filter widgets', exact: true })
  await expect.element(noneApplied).toBeVisible()

  await noneApplied.click()
  await page.getByRole('button', { name: 'Apply type filter' }).click()
  await userEvent.keyboard('{Escape}')
  const oneApplied = page.getByRole('button', { name: 'Filter widgets (1 applied)' })
  await expect.element(oneApplied).toBeVisible()
  // this is the non-accessible text
  await expect.element(oneApplied.getByText('1')).toBeVisible()

  await oneApplied.click()
  await nameField().fill('abc')
  await applyButton().click()
  await expect
    .element(page.getByRole('button', { name: 'Filter widgets (2 applied)' }))
    .toBeVisible()

  await filterButton().click()
  await page.getByRole('textbox', { name: 'Owner' }).fill('abc')
  await applyButton().click()
  await expect
    .element(page.getByRole('button', { name: 'Filter widgets (3 applied)' }))
    .toBeVisible()
})

test('apply submits the values and closes only if there are no validation errors', async () => {
  await render(<Harness />)
  await filterButton().click()
  await nameField().fill('bad')
  await applyButton().click()
  await expect.element(form().getByText('No bad names')).toBeVisible()
  await expect.element(appliedName()).toHaveTextContent('')

  await nameField().fill('good')
  await applyButton().click()
  await expect.element(form()).not.toBeInTheDocument()
  await expect.element(appliedName()).toHaveTextContent('good')
})

test('reset applies the reset values', async () => {
  await render(<Harness />)
  await filterButton().click()
  await nameField().fill('abc')
  await applyButton().click()
  await expect.element(appliedName()).toHaveTextContent('abc')
  await filterButton().click()
  await resetButton().click()
  await expect.element(form()).not.toBeInTheDocument()
  await expect.element(appliedName()).toHaveTextContent('')
  await expect
    .element(page.getByRole('button', { name: 'Filter widgets', exact: true }))
    .toBeVisible()
})

test('reset is disabled when nothing is applied', async () => {
  await render(<Harness />)
  await filterButton().click()
  await expect.element(resetButton()).toBeDisabled()

  // it's also disabled if you simply restore the default form values manually
  await nameField().fill('abc')
  await applyButton().click()
  await filterButton().click()
  await nameField().fill('')
  await applyButton().click()
  await filterButton().click()
  await expect.element(resetButton()).toBeDisabled()
})

test('unapplied edits are discarded on close', async () => {
  await render(<Harness />)
  await filterButton().click()
  await nameField().fill('draft')
  await userEvent.keyboard('{Escape}')
  await expect.element(form()).not.toBeInTheDocument()

  await filterButton().click()
  await expect.element(nameField()).toHaveValue('')
})
