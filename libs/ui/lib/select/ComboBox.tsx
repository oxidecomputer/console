import cn from 'classnames'
import { useRef } from 'react'
import type { AriaComboBoxProps } from 'react-aria'
import { useButton, useComboBox, useFilter } from 'react-aria'
import { useComboBoxState } from 'react-stately'

import { SelectArrows6Icon } from '@oxide/ui'

import { Popover } from '../util/Popover'
import { ListBox } from './ListBox'

export interface ComboBoxProps<T extends object> extends AriaComboBoxProps<T> {
  label: string
  name: string
  placeholder?: string
  disabled?: boolean
  hasError?: boolean
}

export function ComboBox<T extends object>({
  disabled,
  hasError,
  ...props
}: ComboBoxProps<T>) {
  const { contains } = useFilter({ sensitivity: 'base' })
  const state = useComboBoxState({ ...props, defaultFilter: contains })

  const buttonRef = useRef(null)
  const inputRef = useRef(null)
  const listBoxRef = useRef(null)
  const popoverRef = useRef(null)

  const {
    buttonProps: triggerProps,
    inputProps,
    listBoxProps,
  } = useComboBox(
    {
      ...props,
      inputRef,
      buttonRef,
      listBoxRef,
      popoverRef,
    },
    state
  )

  const { buttonProps } = useButton(triggerProps, buttonRef)

  return (
    <div className="relative w-full">
      <button
        {...buttonProps}
        ref={buttonRef}
        className={cn(
          `relative flex h-10 w-full items-center
          justify-between rounded border hover:bg-secondary`,
          hasError ? 'focus-error border-destructive' : 'border-default',
          (state.isOpen || state.isFocused) && 'ring-2 ring-accent-secondary',
          state.isOpen && hasError && 'ring-error-secondary',
          disabled ? 'cursor-not-allowed text-disabled bg-disabled' : 'bg-default'
        )}
      >
        <input
          {...inputProps}
          ref={inputRef}
          className="h-full w-full !bg-transparent px-3 !outline-none text-sans-md placeholder:text-quaternary"
        />
        <div className="ml-3 flex h-[calc(100%-12px)] items-center border-l px-3 border-secondary">
          <SelectArrows6Icon title="Select" className="w-2 text-tertiary" />
        </div>
      </button>
      {state.isOpen && (
        <Popover
          state={state}
          popoverRef={popoverRef}
          triggerRef={buttonRef}
          offset={12}
          placement="bottom start"
          matchTriggerWidth
        >
          <ListBox {...listBoxProps} listBoxRef={listBoxRef} state={state} />
        </Popover>
      )}
    </div>
  )
}
