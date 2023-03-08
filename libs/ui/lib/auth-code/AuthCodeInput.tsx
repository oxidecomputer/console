// Borrowed with modification from https://github.com/drac94/react-auth-code-input
// Copyright (c) 2020-present Luis Guerrero
// MIT license
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import invariant from 'tiny-invariant'

export type AuthCodeProps = {
  ariaLabel?: string
  autoFocus?: boolean
  containerClassName?: string
  disabled?: boolean
  inputClassName?: string
  length?: number
  placeholder?: string
  onChange: (res: string) => void
}

export type AuthCodeRef = {
  focus: () => void
  clear: () => void
}

const INPUT_PATTERN = '[a-zA-Z0-9]{1}'

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
    },
    ref
  ) => {
    invariant(!isNaN(length) || length > 0, 'Length must be a number greater than 0')

    const inputsRef = useRef<Array<HTMLInputElement>>([])

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (inputsRef.current) {
          inputsRef.current[0].focus()
        }
      },
      clear: () => {
        if (inputsRef.current) {
          for (let i = 0; i < inputsRef.current.length; i++) {
            inputsRef.current[i].value = ''
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
      const res = inputsRef.current.map((input) => input.value).join('')
      onChange && onChange(res)
    }

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value, nextElementSibling },
      } = e
      if (value.length > 1) {
        e.target.value = value.charAt(0)
        if (nextElementSibling !== null) {
          ;(nextElementSibling as HTMLInputElement).focus()
        }
      } else {
        if (value.match(INPUT_PATTERN)) {
          if (nextElementSibling !== null) {
            ;(nextElementSibling as HTMLInputElement).focus()
          }
        } else {
          e.target.value = ''
        }
      }
      sendResult()
    }

    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const { key } = e
      const target = e.target as HTMLInputElement
      if (key === 'Backspace') {
        if (target.value === '') {
          if (target.previousElementSibling !== null) {
            const t = target.previousElementSibling as HTMLInputElement
            t.value = ''
            t.focus()
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
        if (pastedCharacter.match(INPUT_PATTERN)) {
          if (!currentValue) {
            inputsRef.current[currentInput].value = pastedCharacter
            if (inputsRef.current[currentInput].nextElementSibling !== null) {
              ;(
                inputsRef.current[currentInput].nextElementSibling as HTMLInputElement
              ).focus()
              currentInput++
            }
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
    }

    return <div className={containerClassName}>{inputs}</div>
  }
)
