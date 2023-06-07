import cn from 'classnames'
import { useRef } from 'react'
import type { AriaSelectProps } from 'react-aria'
import { HiddenSelect, useButton, useSelect } from 'react-aria'
import { useSelectState } from 'react-stately'

import { SelectArrows6Icon } from '@oxide/ui'

import { Popover } from '../util/Popover'
import { ListBox } from './ListBox'

export interface SelectProps<T extends object> extends AriaSelectProps<T> {
  label: string
  name: string
  placeholder?: string
  disabled?: boolean
  hasError?: boolean
}

export function Select<T extends object>({
  placeholder,
  disabled,
  hasError,
  ...props
}: SelectProps<T>) {
  // Create state based on the incoming props
  const state = useSelectState(props)

  // Get props for child elements from useSelect
  const ref = useRef(null)
  const { triggerProps, valueProps, menuProps } = useSelect(props, state, ref)

  // Get props for the button based on the trigger props from useSelect
  const { buttonProps } = useButton(triggerProps, ref)

  return (
    <div className="relative w-full">
      <HiddenSelect state={state} triggerRef={ref} label={props.label} name={props.name} />
      <button
        {...buttonProps}
        ref={ref}
        className={cn(
          `flex h-10 w-full items-center justify-between
          rounded border px-3 text-sans-md`,
          hasError
            ? 'focus-error border-error-secondary hover:border-error'
            : 'border-default hover:border-hover',
          state.isOpen && 'ring-2 ring-accent-secondary',
          state.isOpen && hasError && 'ring-error-secondary',
          disabled ? 'cursor-not-allowed text-disabled bg-disabled' : 'bg-default'
        )}
      >
        <span
          {...valueProps}
          className={`${state.selectedItem ? 'text-default' : 'text-quaternary'}`}
        >
          {state.selectedItem
            ? state.selectedItem.rendered
            : placeholder || 'Select an option'}
        </span>

        <div className="ml-3 flex h-[calc(100%-12px)] items-center border-l border-secondary">
          <SelectArrows6Icon title="Select" className="ml-3 w-2 text-tertiary" />
        </div>
      </button>
      {state.isOpen && (
        <Popover
          state={state}
          triggerRef={ref}
          offset={12}
          placement="bottom start"
          matchTriggerWidth
        >
          <ListBox {...menuProps} state={state} />
        </Popover>
      )}
    </div>
  )
}
