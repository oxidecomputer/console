/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 *
 * This file incorporates work covered by the following copyright and
 * permission notice:
 *
 *   Copyright (c) 2020-present Luis Guerrero
 *
 *   Use of this source code is governed by an MIT-style
 *   license that can be found in the LICENSE file or at
 *   https://opensource.org/licenses/MIT.
 */
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

import { invariant } from '@oxide/util'

export type AuthCodeProps = {
  ariaLabel?: string
  autoFocus?: boolean
  containerClassName?: string
  disabled?: boolean
  inputClassName?: string
  length?: number
  placeholder?: string
  onChange: (res: string) => void
  /** Insert separator dashes after these indices */
  dashAfterIdxs?: number[]
}

export type AuthCodeRef = {
  focus: () => void
  clear: () => void
}

const INPUT_PATTERN = '[a-zA-Z]{1}'

// the reason these helpers are here is we to skip the dashes when we're looking
// to focus the next or previous input

const isInput = (el: Element): el is HTMLInputElement =>
  el.tagName.toLowerCase() === 'input'

function getNextInputSibling(el: Element): HTMLInputElement | null {
  let elt = el
  while (elt.nextElementSibling) {
    if (isInput(elt.nextElementSibling)) return elt.nextElementSibling
    elt = elt.nextElementSibling
  }
  return null
}

function getPrevInputSibling(el: Element): HTMLInputElement | null {
  let elt = el
  while (elt.previousElementSibling) {
    if (isInput(elt.previousElementSibling)) return elt.previousElementSibling
    elt = elt.previousElementSibling
  }
  return null
}

const Dash = () => (
  <span className="flex items-center px-1 text-quinary">
    {/* sorry about this margin. it must be done */}
    <span className="mb-0.5">&ndash;</span>
  </span>
)

// See https://github.com/drac94/react-auth-code-input
export const AuthCodeInput = forwardRef<AuthCodeRef, AuthCodeProps>(
  (
    {
      ariaLabel,
      autoFocus = true,
      containerClassName,
      disabled,
      inputClassName,
      length = 6,
      placeholder,
      onChange,
      dashAfterIdxs = [],
    },
    ref
  ) => {
    invariant(!isNaN(length) || length > 0, 'Length must be a number greater than 0')
    invariant(
      dashAfterIdxs.every((i) => 0 <= i && i < length - 1),
      '"Dash after" indices must mark spots between inputs, i.e., 0 <= i < length - 1'
    )

    const inputsRef = useRef<Array<HTMLInputElement>>([])

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (inputsRef.current) {
          inputsRef.current[0].focus()
        }
      },
      clear: () => {
        if (inputsRef.current) {
          for (const input of inputsRef.current) {
            input.value = ''
          }
          inputsRef.current[0].focus()
        }
        sendResult()
      },
    }))

    useEffect(() => {
      if (autoFocus) {
        inputsRef.current[0].focus()
      }
    }, [autoFocus])

    const sendResult = () => {
      // user_code is always uppercase
      // https://github.com/oxidecomputer/omicron/blob/c63fe1658674186d974e3287afdce09b07912afd/nexus/db-model/src/device_auth.rs#L72-L77
      const res = inputsRef.current
        .map((input) => input.value)
        .join('')
        .toUpperCase()
      onChange && onChange(res)
    }

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target
      const nextInput = getNextInputSibling(e.target)
      if (value.length > 1) {
        e.target.value = value.charAt(0)
        if (nextInput) {
          nextInput.focus()
        }
      } else {
        if (value.match(INPUT_PATTERN)) {
          if (nextInput) {
            nextInput.focus()
          }
        } else {
          e.target.value = ''
        }
      }
      sendResult()
    }

    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const target = e.target as HTMLInputElement
      if (e.key === 'Backspace') {
        if (target.value === '') {
          const prevInput = getPrevInputSibling(target)
          if (prevInput !== null) {
            prevInput.value = ''
            prevInput.focus()
            e.preventDefault()
          }
        } else {
          target.value = ''
        }
        sendResult()
      }
    }

    const handleOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.select()
    }

    const handleOnPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pastedValue = e.clipboardData.getData('Text')

      let currentInput = 0

      for (let i = 0; i < pastedValue.length; i++) {
        const pastedCharacter = pastedValue.charAt(i)
        const currentValue = inputsRef.current[currentInput].value
        if (pastedCharacter.match(INPUT_PATTERN) && !currentValue) {
          const input = inputsRef.current[currentInput]
          input.value = pastedCharacter
          const nextInput = getNextInputSibling(input)
          if (nextInput !== null) {
            nextInput.focus()
            currentInput++
          }
        }
      }
      sendResult()

      e.preventDefault()
    }

    const inputs = []
    for (let i = 0; i < length; i++) {
      inputs.push(
        <input
          key={i}
          type="text"
          inputMode="text"
          onChange={handleOnChange}
          onKeyDown={handleOnKeyDown}
          onFocus={handleOnFocus}
          onPaste={handleOnPaste}
          pattern={INPUT_PATTERN}
          ref={(el: HTMLInputElement) => {
            inputsRef.current[i] = el
          }}
          maxLength={1}
          className={inputClassName}
          autoComplete="off"
          aria-label={
            ariaLabel ? `${ariaLabel}. Character ${i + 1}.` : `Character ${i + 1}.`
          }
          disabled={disabled}
          placeholder={placeholder}
        />
      )

      if (dashAfterIdxs.includes(i)) {
        inputs.push(<Dash key={`${i}-dash`} />)
      }
    }

    return <div className={containerClassName}>{inputs}</div>
  }
)
