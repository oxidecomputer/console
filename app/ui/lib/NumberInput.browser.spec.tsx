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

test('does not clamp typed values to minValue or maxValue', async () => {
  const screen = await render(
    <NumberInputHarness value={15} minValue={10} maxValue={100} />
  )
  const input = screen.getByRole('textbox', { name: 'Test number' })

  // over max: the text stays as typed and the parent sees the typed value
  // right away, not only on blur
  await input.fill('150')
  await expect.element(input).toHaveValue('150')
  await expect.element(screen.getByText('Changes: 150')).toBeVisible()
  await userEvent.tab()
  await expect.element(input).toHaveValue('150')

  // under min
  await input.fill('2')
  await userEvent.keyboard('{Enter}')
  await expect.element(input).toHaveValue('2')
  await expect.element(screen.getByText('Changes: 150, 2')).toBeVisible()
})

test('steppers stop at minValue and maxValue', async () => {
  const screen = await render(<NumberInputHarness value={9} minValue={8} maxValue={10} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })
  const increase = screen.getByRole('button', { name: 'Increase Test number' })
  const decrease = screen.getByRole('button', { name: 'Decrease Test number' })

  await increase.click()
  await expect.element(input).toHaveValue('10')
  await expect.element(increase).toBeDisabled()

  await decrease.click()
  await decrease.click()
  await expect.element(input).toHaveValue('8')
  await expect.element(decrease).toBeDisabled()
})

test('stepping an out-of-range typed value lands in range', async () => {
  const screen = await render(<NumberInputHarness minValue={10} maxValue={20} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await input.fill('2')
  await screen.getByRole('button', { name: 'Increase Test number' }).click()
  await expect.element(input).toHaveValue('10')

  await input.fill('50')
  await screen.getByRole('button', { name: 'Decrease Test number' }).click()
  await expect.element(input).toHaveValue('20')
})

test('does not clamp intermediate input while typing', async () => {
  const screen = await render(<NumberInputHarness minValue={10} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await input.click()
  // if clamping happened mid-typing, this would be 10 after hitting 2, then 100 after hitting 0
  await userEvent.type(input, '20')
  await expect.element(input).toHaveValue('20')

  await userEvent.tab()
  await expect.element(input).toHaveValue('20')
})

test('does not snap typed values to step', async () => {
  const screen = await render(<NumberInputHarness step={1} minValue={10} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await input.click()
  await userEvent.type(input, '20')
  await expect.element(input).toHaveValue('20')
  await userEvent.type(input, '.1')
  await expect.element(input).toHaveValue('20.1')

  await userEvent.tab()
  await expect.element(input).toHaveValue('20.1')
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
  await userEvent.tab()
  await expect.element(input).toHaveValue('1099')

  await input.fill('007')
  await userEvent.tab()
  await expect.element(input).toHaveValue('7')
})
