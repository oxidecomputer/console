/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ReactNode } from 'react'

import { KEYS } from '~/ui/util/keys'

type SubformProps = {
  /** Called when the user presses Enter in one of the subform's inputs */
  onSubmit: () => void
  className?: string
  children: ReactNode
}

/**
 * Container for the fields of a subform: a nested `useForm` rendered inside an
 * outer form, like the firewall rule targets or webhook secrets. A subform is
 * not a DOM form, so Enter in one of its inputs would submit the outer form.
 * This catches the Enter as it bubbles and submits the subform instead, so the
 * fields themselves don't need any Enter handling.
 *
 * A combobox with its options open handles Enter itself (selecting the
 * highlighted option) and stops propagation, so that Enter never gets here.
 */
export function Subform({ onSubmit, className, children }: SubformProps) {
  return (
    // The div only listens for Enter bubbling up from the inputs inside it
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={className}
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
      {children}
    </div>
  )
}
