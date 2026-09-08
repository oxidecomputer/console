/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { clearAnnouncer, destroyAnnouncer } from '@react-aria/live-announcer'
import { useState } from 'react'
import * as R from 'remeda'
import { afterAll, afterEach, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { page, userEvent } from 'vitest/browser'

import { NumberInput } from './NumberInput'

afterEach(() => clearAnnouncer('assertive'))
afterAll(destroyAnnouncer)

type Props = Omit<React.ComponentProps<typeof NumberInput>, 'onChange'> & {
  recordChanges?: boolean
  /** Renders a button that sets the value from outside the input */
  externalValue?: number
}

function NumberInputHarness({ recordChanges = true, externalValue, ...props }: Props) {
  const [value, setValue] = useState<number>(props.value ?? NaN)
  const [changes, setChanges] = useState<number[]>([])
  return (
    <>
      {externalValue !== undefined && (
        <button type="button" onClick={() => setValue(externalValue)}>
          Set externally
        </button>
      )}
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

test('clamps typed values above maxValue on blur', async () => {
  const screen = await render(<NumberInputHarness value={5} maxValue={100} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  // out-of-range values are left alone while editing, not clamped mid-keystroke
  await input.fill('150')
  await expect.element(input).toHaveValue('150')

  await userEvent.tab()
  await expect.element(screen.getByText('Changes: 100')).toBeVisible()
  await expect.element(input).toHaveValue('100')
})

test('clamps typed values below minValue on blur', async () => {
  const screen = await render(<NumberInputHarness minValue={1} value={5} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await input.fill('0')
  await expect.element(input).toHaveValue('0')

  await userEvent.tab()
  await expect.element(screen.getByText('Changes: 1')).toBeVisible()
  await expect.element(input).toHaveValue('1')
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

test('does not step intermediate input while typing', async () => {
  const screen = await render(<NumberInputHarness step={1} minValue={10} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await input.click()
  await userEvent.type(input, '20')
  await expect.element(input).toHaveValue('20')
  await userEvent.type(input, '.1')
  await expect.element(input).toHaveValue('20.1')

  await userEvent.tab()
  await expect.element(input).toHaveValue('20')
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
  await expect.element(input).toHaveValue('1023')

  await input.fill('10239')
  await userEvent.tab()
  await expect.element(input).toHaveValue('1023')
})

test('stepper buttons increment and decrement within bounds', async () => {
  const screen = await render(<NumberInputHarness value={9} minValue={8} maxValue={10} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })
  const increase = screen.getByRole('button', { name: 'Increase Test number' })
  const decrease = screen.getByRole('button', { name: 'Decrease Test number' })

  await increase.click()
  await expect.element(input).toHaveValue('10')
  await expect.element(screen.getByText('Changes: 10')).toBeVisible()
  await expect.element(increase).toBeDisabled()

  await decrease.click()
  await decrease.click()
  await expect.element(input).toHaveValue('8')
  await expect.element(screen.getByText('Changes: 10, 9, 8')).toBeVisible()
  await expect.element(decrease).toBeDisabled()
})

test('incrementing an empty input starts from the minimum', async () => {
  const screen = await render(<NumberInputHarness minValue={5} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await screen.getByRole('button', { name: 'Increase Test number' }).click()

  await expect.element(input).toHaveValue('5')
  await expect.element(screen.getByText('Changes: 5')).toBeVisible()
})

test('arrow keys step the value and commit', async () => {
  const screen = await render(<NumberInputHarness value={5} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await userEvent.click(input)
  await userEvent.keyboard('{ArrowUp}{ArrowUp}')
  await expect.element(input).toHaveValue('7')
  await userEvent.keyboard('{ArrowDown}')

  await expect.element(input).toHaveValue('6')
  await expect.element(screen.getByText('Changes: 6, 7, 6')).toBeVisible()
})

test('rejects non-numeric characters while typing', async () => {
  const screen = await render(<NumberInputHarness />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await userEvent.type(input, 'a')
  await expect.element(input).toHaveValue('')
  await userEvent.type(input, '1')
  await expect.element(input).toHaveValue('1')
  await userEvent.type(input, 'b')
  await expect.element(input).toHaveValue('1')
  await userEvent.type(input, '2')
  await expect.element(input).toHaveValue('12')
  await userEvent.type(input, 'c')
  await expect.element(input).toHaveValue('12')
  await expect.element(screen.getByText('Changes: 1, 12')).toBeVisible()
})

test('allows a leading minus sign when negative values are in range', async () => {
  const screen = await render(<NumberInputHarness minValue={-10} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await userEvent.type(input, '-')
  await expect.element(input).toHaveValue('-')
  await userEvent.type(input, '3')

  await expect.element(input).toHaveValue('-3')
  await expect.element(screen.getByText('Changes: -3')).toBeVisible()
})

test('reflects a value set from outside the input', async () => {
  const screen = await render(<NumberInputHarness value={1} externalValue={42} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await screen.getByRole('button', { name: 'Set externally' }).click()

  await expect.element(input).toHaveValue('42')
  // the parent set the value itself, so onChange doesn't fire
  await expect.element(screen.getByText('Changes: (none)')).toBeVisible()
})

test('disabled input and steppers cannot be used', async () => {
  const screen = await render(<NumberInputHarness value={3} isDisabled />)

  await expect.element(screen.getByRole('textbox', { name: 'Test number' })).toBeDisabled()
  await expect
    .element(screen.getByRole('button', { name: 'Increase Test number' }))
    .toBeDisabled()
  await expect
    .element(screen.getByRole('button', { name: 'Decrease Test number' }))
    .toBeDisabled()
})

test('announces values changed by arrow keys and stepper buttons', async () => {
  const screen = await render(<NumberInputHarness value={9} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })
  const announcements = page.getByRole('log').first()

  await input.click()
  await userEvent.keyboard('{ArrowUp}')
  await expect.element(announcements).toHaveAttribute('aria-live', 'assertive')
  await expect.element(announcements).toHaveTextContent('10')
  clearAnnouncer('assertive')

  await userEvent.keyboard('{ArrowDown}')
  await expect.element(announcements).toHaveTextContent('9')
  clearAnnouncer('assertive')

  await screen.getByRole('button', { name: 'Increase Test number' }).click()
  await expect.element(announcements).toHaveTextContent('10')
  clearAnnouncer('assertive')

  await screen.getByRole('button', { name: 'Decrease Test number' }).click()
  await expect.element(announcements).toHaveTextContent('9')
})
