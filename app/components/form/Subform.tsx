/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import type { ReactNode } from 'react'

import { Button } from '~/ui/lib/Button'
import { KEYS } from '~/ui/util/keys'

type SubformProps = {
  /** Called on Enter in one of the subform's inputs and on the Add button */
  onSubmit: () => void
  onClear: () => void
  addButtonLabel: string
  /** Disables the Clear and Add buttons */
  disabled: boolean
  className?: string
  children: ReactNode
}

/**
 * Container for the fields of a subform: a nested `useForm` rendered inside an
 * outer form, like the firewall rule targets or webhook secrets, followed by
 * Clear and Add buttons for adding the result to a list. A subform is
 * not a DOM form, so Enter in one of its inputs would submit the outer form.
 * This catches the Enter as it bubbles and submits the subform instead, so the
 * fields themselves don't need any Enter handling.
 *
 * A combobox with its options open handles Enter itself (selecting the
 * highlighted option) and stops propagation, so that Enter never gets here.
 */
export function Subform({
  onSubmit,
  onClear,
  addButtonLabel,
  disabled,
  className,
  children,
}: SubformProps) {
  return (
    // The div only listens for Enter bubbling up from the inputs inside it
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={cn('flex flex-col gap-3', className)}
      onKeyDown={(e) => {
        if (
          e.key === KEYS.enter &&
          // a field already handled this Enter
          !e.defaultPrevented &&
          // Enter that commits an IME composition isn't a submit
          !e.nativeEvent.isComposing &&
          // buttons (Add, Clear, listbox triggers) handle Enter themselves
          e.target instanceof HTMLInputElement
        ) {
          e.preventDefault() // prevent full form submission
          onSubmit()
        }
      }}
    >
      <div className="ox-subform">{children}</div>
      <div className="flex justify-end gap-2.5">
        <Button variant="ghost" size="sm" onClick={onClear} disabled={disabled}>
          Clear
        </Button>
        <Button size="sm" onClick={onSubmit} disabled={disabled}>
          {addButtonLabel}
        </Button>
      </div>
    </div>
  )
}
