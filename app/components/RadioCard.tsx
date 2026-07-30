import cn from 'classnames'
import { useId } from 'react'
import type { ReactNode } from 'react'

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Warning12Icon } from '@oxide/design-system/icons/react'

import { RadioIndicator } from '~/ui/lib/Radio'

/**
 * A radio button styled as a full-width card with a label, description, and
 * an optional notice (e.g. explaining why the option is disabled). Compose a
 * list of these sharing one `name` to build a set of mutually exclusive
 * options, e.g. for `extraContent` in `confirmDelete`/`confirmAction`.
 */
export function RadioCard({
  name,
  checked,
  onChange,
  disabled,
  label,
  description,
  notice,
}: {
  name: string
  checked: boolean
  onChange: () => void
  disabled?: boolean
  label: ReactNode
  description: ReactNode
  notice?: ReactNode
}) {
  // htmlFor + id because the a11y lint rule can't see the nested input
  const id = useId()
  return (
    <label
      htmlFor={id}
      className={cn(
        'has-[:focus-visible]:ring-accent-secondary block rounded-md border p-3 has-[:focus-visible]:ring-2',
        disabled
          ? 'border-default bg-disabled cursor-not-allowed'
          : cn(
              'cursor-pointer',
              checked
                ? 'bg-accent border-accent-secondary hover:border-accent'
                : 'border-default hover:border-raise'
            )
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="pr-4">
          <div
            className={cn(
              'text-sans-semi-md',
              disabled ? 'text-disabled' : checked ? 'text-accent' : 'text-raise'
            )}
          >
            {label}
          </div>
          <div
            className={cn(
              'text-sans-md mt-0.5',
              disabled
                ? 'text-disabled'
                : checked
                  ? 'text-accent-secondary'
                  : 'text-default'
            )}
          >
            {description}
          </div>
        </div>
        <RadioIndicator
          id={id}
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
        />
      </div>
      {notice && (
        <div className="text-sans-md text-secondary -m-3 mt-3 flex items-center gap-1.5 border-t px-3 py-2.5">
          <Warning12Icon className="text-notice shrink-0" />
          {notice}
        </div>
      )}
    </label>
  )
}
