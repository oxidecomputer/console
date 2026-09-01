/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import * as R from 'remeda'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'

import { NumberInput } from './NumberInput'

type Props = Omit<React.ComponentProps<typeof NumberInput>, 'onChange'> & {
  recordChanges?: boolean
}

function NumberInputHarness({ recordChanges = true, ...props }: Props) {
  const [value, setValue] = useState<number>(props.value ?? NaN)
  const [changes, setChanges] = useState<number[]>([])
  return (
    <>
      <NumberInput
        aria-label="Test number"
        formatOptions={{ useGrouping: false }}
        {...props}
        value={value}
        onChange={(nextValue) => {
          setValue(nextValue)
          if (recordChanges) setChanges((values) => [...values, nextValue])
        }}
      />
      <output>Changes: {changes.length ? changes.map(String).join(', ') : '(none)'}</output>
    </>
  )
}

test('fires onChange per keystroke with the parsed number', async () => {
  const screen = await render(<NumberInputHarness />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await userEvent.type(input, '1')
  await expect.element(screen.getByText('Changes: 1')).toBeVisible()
  await userEvent.type(input, '2')

  await expect.element(screen.getByText('Changes: 1, 12')).toBeVisible()
})

test('fires onChange with NaN when the input is cleared', async () => {
  const screen = await render(<NumberInputHarness value={1} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await input.clear()

  await expect.element(screen.getByText('Changes: NaN')).toBeVisible()
})

test('clamps typed values above maxValue', async () => {
  const screen = await render(<NumberInputHarness value={5} maxValue={100} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await input.fill('150')

  await expect.element(screen.getByText('Changes: 100')).toBeVisible()
  await expect.element(input).toHaveValue('100')
})

test('clamps typed values below minValue', async () => {
  const screen = await render(<NumberInputHarness minValue={1} value={5} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await input.fill('0')

  await expect.element(screen.getByText('Changes: 1')).toBeVisible()
  await expect.element(input).toHaveValue('1')
})

test('only simplifies numbers on blur', async () => {
  const screen = await render(<NumberInputHarness />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await input.fill('0')
  await expect.element(screen.getByText('Changes: 0')).toBeVisible()

  for (const precision of R.range(0, 6)) {
    const value = `1.${'0'.repeat(precision)}` // 1., 1.0, etc.
    await input.fill(value)
    await expect.element(screen.getByText('Changes: 0')).toBeVisible()
    await expect.element(input).toHaveValue(value)
  }

  await userEvent.tab()

  await expect.element(screen.getByText('Changes: 0, 1')).toBeVisible()
  await expect.element(input).toHaveValue('1')
})

test('still controls the displayed value when onChange causes no re-render', async () => {
  const screen = await render(<NumberInputHarness maxValue={1023} recordChanges={false} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await input.fill('1099')
  await expect.element(input).toHaveValue('1023')

  await input.fill('10239')
  await expect.element(input).toHaveValue('1023')
})
