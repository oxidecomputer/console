/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { NumberField } from './NumberField'

function Harness({
  defaultValue = 2,
  allowDecimals = false,
  required = true,
}: {
  defaultValue?: number
  allowDecimals?: boolean
  required?: boolean
}) {
  const form = useForm({ defaultValues: { count: defaultValue } })
  const [submitted, setSubmitted] = useState<number>()
  return (
    <form
      aria-label="Count form"
      onSubmit={form.handleSubmit(({ count }) => setSubmitted(count))}
    >
      <NumberField
        name="count"
        label="Count"
        control={form.control}
        required={required}
        allowDecimals={allowDecimals}
      />
      <button type="submit">Save</button>
      <output>Submitted: {submitted ?? 'none'}</output>
    </form>
  )
}

// Error text lookups are scoped to the form because the error is also
// announced through react-aria's live region, a copy appended to the body
// that lingers for 7s. A body-wide getByText would match both and stall.

test('rejects a fractional value already in form state', async () => {
  const screen = await render(<Harness defaultValue={2.5} />)
  const form = screen.getByRole('form', { name: 'Count form' })
  await screen.getByRole('button', { name: 'Save' }).click()
  await expect.element(form.getByText('Must be a whole number')).toBeVisible()
  await expect.element(screen.getByText('Submitted: none')).toBeVisible()
})

test('keeps a typed fraction, blocks submit, and clears the error when corrected', async () => {
  const screen = await render(<Harness />)
  const form = screen.getByRole('form', { name: 'Count form' })
  const input = screen.getByRole('textbox', { name: 'Count' })
  await input.fill('2.5')
  await screen.getByRole('button', { name: 'Save' }).click()
  await expect.element(input).toHaveValue('2.5')
  await expect.element(form.getByText('Must be a whole number')).toBeVisible()
  await expect.element(screen.getByText('Submitted: none')).toBeVisible()
  await input.fill('3')
  await expect.element(form.getByText('Must be a whole number')).not.toBeInTheDocument()
  await screen.getByRole('button', { name: 'Save' }).click()
  await expect.element(screen.getByText('Submitted: 3')).toBeVisible()
})

test('allows fractional quota values when decimals are enabled', async () => {
  const screen = await render(<Harness allowDecimals />)
  const input = screen.getByRole('textbox', { name: 'Count' })
  await input.fill('1.5')
  await screen.getByRole('button', { name: 'Save' }).click()
  await expect.element(input).toHaveValue('1.5')
  await expect.element(screen.getByText('Submitted: 1.5')).toBeVisible()
})

test('still accepts an empty optional field', async () => {
  const screen = await render(<Harness required={false} />)
  await screen.getByRole('textbox', { name: 'Count' }).clear()
  await screen.getByRole('button', { name: 'Save' }).click()
  await expect.element(screen.getByText('Submitted: NaN')).toBeVisible()
})
