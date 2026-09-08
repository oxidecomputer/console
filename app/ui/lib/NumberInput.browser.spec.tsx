/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { clearAnnouncer, destroyAnnouncer } from '@react-aria/live-announcer'
import { useState } from 'react'
import { afterAll, afterEach, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { page, userEvent } from 'vitest/browser'

import { NumberInput } from './NumberInput'

afterEach(() => clearAnnouncer('assertive'))
afterAll(destroyAnnouncer)

type Props = Omit<
  React.ComponentProps<typeof NumberInput>,
  'onChange' | 'value' | 'label'
> & {
  value?: number
  /** Renders a button that sets the value from outside the input */
  externalValue?: number
}

function NumberInputHarness({ externalValue, ...props }: Props) {
  const [value, setValue] = useState<number>(props.value ?? NaN)
  const [changes, setChanges] = useState<number[]>([])
  return (
    <>
      <label htmlFor="test-number">Test number</label>
      <NumberInput
        id="test-number"
        label="Test number"
        {...props}
        value={value}
        onChange={(nextValue) => {
          setValue(nextValue)
          setChanges((values) => [...values, nextValue])
        }}
      />
      {externalValue !== undefined && (
        <button type="button" onClick={() => setValue(externalValue)}>
          Set externally
        </button>
      )}
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

test('does not clamp typed values to min or max', async () => {
  const screen = await render(<NumberInputHarness value={15} min={10} max={100} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  // typing each digit separately lets the input process the intermediate value
  await userEvent.type(input, '2')
  await userEvent.type(input, '0')
  await expect.element(input).toHaveValue('1520')
  await userEvent.tab()
  await expect.element(input).toHaveValue('1520')

  await input.fill('2')
  await userEvent.keyboard('{Enter}')

  await expect.element(input).toHaveValue('2')
  await expect.element(screen.getByText('Changes: 152, 1520, 2')).toBeVisible()
})

test('rejects non-digit characters', async () => {
  const screen = await render(<NumberInputHarness />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await userEvent.type(input, 'a1b-2.c')

  await expect.element(input).toHaveValue('12')
  await expect.element(screen.getByText('Changes: 1, 12')).toBeVisible()
})

test('normalizes leading zeros', async () => {
  const screen = await render(<NumberInputHarness />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await userEvent.type(input, '0')
  await userEvent.type(input, '0')
  await userEvent.type(input, '7')

  await expect.element(input).toHaveValue('7')
  await expect.element(screen.getByText('Changes: 0, 7')).toBeVisible()
})

test('rejects unsafe integers and keeps the value editable', async () => {
  const screen = await render(<NumberInputHarness value={12} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  for (const value of ['9007199254740993', '1000000000000000000000', '9'.repeat(309)]) {
    await input.fill(value)
    await expect.element(input).toHaveValue('12')
  }
  await expect.element(screen.getByText('Changes: (none)')).toBeVisible()

  await input.fill(String(Number.MAX_SAFE_INTEGER))
  await expect.element(input).toHaveValue('9007199254740991')
  await userEvent.keyboard('{Backspace}')
  await expect.element(input).toHaveValue('900719925474099')
})

test('steppers and arrow keys cannot exceed the largest safe integer', async () => {
  const screen = await render(<NumberInputHarness value={Number.MAX_SAFE_INTEGER - 1} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })
  const increase = screen.getByRole('button', { name: 'Increase Test number' })

  await increase.click()
  await expect.element(input).toHaveValue('9007199254740991')
  await expect.element(increase).toBeDisabled()
  await userEvent.keyboard('{ArrowUp}')
  await expect.element(input).toHaveValue('9007199254740991')
  await userEvent.keyboard('{ArrowDown}')
  await expect.element(input).toHaveValue('9007199254740990')
})

test('stepper buttons increment and decrement within bounds', async () => {
  const screen = await render(<NumberInputHarness value={9} min={8} max={10} />)
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

test('stepping an out-of-range typed value lands in range', async () => {
  const screen = await render(<NumberInputHarness min={10} max={20} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await input.fill('2')
  await screen.getByRole('button', { name: 'Increase Test number' }).click()
  await expect.element(input).toHaveValue('10')

  await input.fill('50')
  await screen.getByRole('button', { name: 'Decrease Test number' }).click()

  await expect.element(input).toHaveValue('20')
})

test('incrementing an empty input starts from the minimum', async () => {
  const screen = await render(<NumberInputHarness min={5} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await screen.getByRole('button', { name: 'Increase Test number' }).click()

  await expect.element(input).toHaveValue('5')
  await expect.element(screen.getByText('Changes: 5')).toBeVisible()
})

test('arrow keys step the value', async () => {
  const screen = await render(<NumberInputHarness value={5} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await userEvent.click(input)
  await userEvent.keyboard('{ArrowUp}{ArrowUp}')
  await expect.element(input).toHaveValue('7')
  await userEvent.keyboard('{ArrowDown}')

  await expect.element(input).toHaveValue('6')
  await expect.element(screen.getByText('Changes: 6, 7, 6')).toBeVisible()
})

test('does not announce typing, external updates, or steps at a bound', async () => {
  const screen = await render(
    <NumberInputHarness value={9} min={8} max={10} externalValue={42} />
  )
  const input = screen.getByRole('textbox', { name: 'Test number' })
  const announcements = page.getByRole('log').first()

  await screen.getByRole('button', { name: 'Increase Test number' }).click()
  await expect.element(announcements).toHaveTextContent('10')
  clearAnnouncer('assertive')
  await userEvent.keyboard('{ArrowUp}')
  await expect.element(announcements).toBeEmptyDOMElement()

  await input.fill('8')
  await userEvent.keyboard('{ArrowDown}')
  await expect.element(announcements).toBeEmptyDOMElement()

  await input.fill('9')
  await screen.getByRole('button', { name: 'Set externally' }).click()
  await expect.element(input).toHaveValue('42')
  await expect.element(announcements).toBeEmptyDOMElement()
})

test('modified arrow keys preserve the value', async () => {
  const screen = await render(<NumberInputHarness value={10} />)
  const input = screen.getByRole('textbox', { name: 'Test number' })

  await input.click()
  for (const modifier of ['Shift', 'Control', 'Alt', 'Meta']) {
    await userEvent.keyboard(`{${modifier}>}{ArrowUp}{/${modifier}}`)
    await expect.element(input).toHaveValue('10')
    await userEvent.keyboard(`{${modifier}>}{ArrowDown}{/${modifier}}`)
    await expect.element(input).toHaveValue('10')
  }
  await expect.element(screen.getByText('Changes: (none)')).toBeVisible()
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
  const screen = await render(<NumberInputHarness value={3} disabled />)

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
