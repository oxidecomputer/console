/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { fireEvent, render } from '@testing-library/react'
import { useState } from 'react'
import * as R from 'remeda'
import { describe, expect, it, vi } from 'vitest'

import { NumberInput } from './NumberInput'

type Props = React.ComponentProps<typeof NumberInput>

function Controlled({ onChange, ...props }: Props) {
  const [value, setValue] = useState<number>(props.value ?? NaN)
  return (
    <NumberInput
      aria-label="test"
      formatOptions={{ useGrouping: false }}
      {...props}
      value={value}
      onChange={(v) => {
        setValue(v)
        onChange?.(v)
      }}
    />
  )
}

const getInput = (container: HTMLElement) => container.querySelector('input')!

describe('NumberInput', () => {
  it('fires onChange per keystroke with the parsed number', () => {
    const onChange = vi.fn()
    const { container } = render(<Controlled onChange={onChange} />)
    const input = getInput(container)

    fireEvent.change(input, { target: { value: '1' } })
    expect(onChange).toHaveBeenLastCalledWith(1)

    fireEvent.change(input, { target: { value: '12' } })
    expect(onChange).toHaveBeenLastCalledWith(12)
  })

  it('fires onChange with NaN when the input is cleared', () => {
    const onChange = vi.fn()
    const { container } = render(<Controlled value={1} onChange={onChange} />)
    const input = getInput(container)

    fireEvent.change(input, { target: { value: '' } })
    expect(onChange).toHaveBeenLastCalledWith(NaN)
  })

  it('clamps typed values above maxValue', () => {
    const onChange = vi.fn()
    const { container } = render(
      <Controlled value={5} maxValue={100} onChange={onChange} />
    )
    const input = getInput(container)

    fireEvent.change(input, { target: { value: '150' } })
    expect(onChange).toHaveBeenLastCalledWith(100)
    expect(input.value).toBe('100')
  })

  it('clamps typed values below minValue', () => {
    const onChange = vi.fn()
    const { container } = render(<Controlled minValue={1} value={5} onChange={onChange} />)
    const input = getInput(container)

    fireEvent.change(input, { target: { value: '0' } })
    expect(onChange).toHaveBeenLastCalledWith(1)
    expect(input.value).toBe('1')
  })

  it('only simplifies numbers on blur', () => {
    const onChange = vi.fn()
    const { container } = render(<Controlled onChange={onChange} />)
    const input = getInput(container)

    fireEvent.change(input, { target: { value: '0' } })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith(0)
    expect(input.value).toBe('0')

    R.times(6, (precision) => {
      const value = `1.${'0'.repeat(precision)}` // 1., 1.0, etc.
      fireEvent.change(input, { target: { value } })
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(input.value).toBe(value)
    })

    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange).toHaveBeenLastCalledWith(1)
    expect(input.value).toBe('1')
  })

  it('still controls the displayed value when onChange causes no re-render', () => {
    const onChange = vi.fn()
    const { container } = render(<Controlled maxValue={1023} onChange={onChange} />)
    const input = getInput(container)

    fireEvent.change(input, { target: { value: '1099' } })
    expect(onChange).toHaveBeenLastCalledWith(1023)
    expect(input.value).toBe('1023')

    fireEvent.change(input, { target: { value: '10239' } })
    expect(onChange).toHaveBeenLastCalledWith(1023)
    expect(input.value).toBe('1023')
  })
})
