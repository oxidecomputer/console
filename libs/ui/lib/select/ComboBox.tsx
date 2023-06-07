import cn from 'classnames'
import { useRef } from 'react'
import type { AriaComboBoxProps } from 'react-aria'
import { useButton, useComboBox, useFilter } from 'react-aria'
import { useComboBoxState } from 'react-stately'

import { SelectArrows6Icon, SpinnerLoader } from '@oxide/ui'

import { Popover } from '../util/Popover'
import { ListBox } from './ListBox'

export interface ComboBoxProps<T extends object> extends AriaComboBoxProps<T> {
  label: string
  name: string
  placeholder?: string
  disabled?: boolean
  hasError?: boolean
  isLoading?: boolean
}

export function ComboBox<T extends object>({
  isDisabled,
  hasError,
  isLoading = false,
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

  const noItems =
    !isLoading && props.defaultItems && Object.values(props.defaultItems).length === 0
  const disabled = isDisabled || noItems

  const { buttonProps } = useButton({ ...triggerProps, isDisabled: disabled }, buttonRef)

  return (
    <div className="relative w-full">
      <button
        {...buttonProps}
        ref={buttonRef}
        className={cn(
          `relative flex h-10 w-full items-center
          justify-between rounded border`,
          hasError
            ? 'focus-error border-error-secondary hover:border-error'
            : 'border-default hover:border-hover',
          (state.isOpen || state.isFocused) && 'ring-2 ring-accent-secondary',
          hasError && 'ring-error-secondary',
          isDisabled || noItems
            ? 'cursor-not-allowed text-disabled bg-disabled'
            : 'bg-default'
        )}
      >
        <div className="flex h-full w-full items-center justify-between pl-3 text-left text-sans-md">
          {noItems ? (
            <div className="flex h-full w-full items-center text-quaternary">No items</div>
          ) : (
            <input
              {...inputProps}
              ref={inputRef}
              className={cn(
                'h-full w-full !bg-transparent !outline-none text-sans-md placeholder:text-quaternary',
                isDisabled && 'pointer-events-none'
              )}
              disabled={isDisabled}
            />
          )}
          <SpinnerLoader isLoading={isLoading} loadTime={500} />
        </div>
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
