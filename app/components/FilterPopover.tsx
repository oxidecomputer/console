/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Popover, PopoverButton, PopoverPanel, useClose } from '@headlessui/react'
import cn from 'classnames'
import type { ReactNode } from 'react'
import {
  useForm,
  type UseFormReturn,
  type FieldValues,
  type DefaultValues,
} from 'react-hook-form'
import * as R from 'remeda'

import { Filter16Icon } from '@oxide/design-system/icons/react'

import { Button, buttonStyle } from '~/ui/lib/Button'
import { Divider } from '~/ui/lib/Divider'
import { Spinner } from '~/ui/lib/Spinner'

type FilterPopoverProps<TFieldValues extends FieldValues> =
  FilterFormProps<TFieldValues> & {
    isFetching: boolean
  }

type FilterFormProps<TFieldValues extends FieldValues> = {
  /**
   * The comparison point for counting the number of active changes, as well as the submitted value when resetting
   */
  resetFieldValues: TFieldValues
  /**
   * The last filters that have been applied. The popover form initializes in this state.
   */
  lastApplied: TFieldValues & DefaultValues<TFieldValues>
  /**
   * Fields you would like in the filter form
   */
  children: (form: UseFormReturn<TFieldValues>) => ReactNode
  handleSubmit: (form: TFieldValues) => void
  /**
   * The term used in labels (e.g. Filter <items>)
   */
  pluralFilteredItemName: string
}

const countApplied = <TFieldValues extends FieldValues>(
  resetFieldValues: TFieldValues,
  lastApplied: TFieldValues
) =>
  Object.entries(resetFieldValues).reduce(
    (count, [key, value]) => (R.isDeepEqual(lastApplied[key], value) ? count : count + 1),
    0
  )

export function FilterPopover<TFieldValues extends FieldValues>({
  children,
  isFetching,
  handleSubmit,
  resetFieldValues,
  pluralFilteredItemName,
  lastApplied,
}: FilterPopoverProps<TFieldValues>) {
  const changeCount = countApplied(resetFieldValues, lastApplied)

  return (
    <Popover>
      <PopoverButton
        aria-label={
          changeCount
            ? `Filter ${pluralFilteredItemName} (${changeCount} applied)`
            : `Filter ${pluralFilteredItemName}`
        }
        className="headless-hide-focus rounded-md"
      >
        <div
          className={cn(
            buttonStyle({ size: 'sm', variant: 'ghost' }),
            changeCount ? 'px-2! gap-1.5' : 'w-8'
          )}
        >
          {isFetching ? (
            <Spinner className="shrink-0" />
          ) : (
            <Filter16Icon
              aria-hidden
              className={cn('shrink-0', changeCount && 'text-accent')}
            />
          )}
          {changeCount ? String(changeCount) : null}
        </div>
      </PopoverButton>
      <PopoverPanel
        className="popover-panel bg-raise light:bg-default shadow-menu z-10 w-96 rounded-lg"
        anchor={{ to: 'bottom end', gap: 12, padding: 16 }}
      >
        <FilterForm
          pluralFilteredItemName={pluralFilteredItemName}
          resetFieldValues={resetFieldValues}
          handleSubmit={handleSubmit}
          lastApplied={lastApplied}
        >
          {children}
        </FilterForm>
      </PopoverPanel>
    </Popover>
  )
}

// This is its own component just so useForm is called fresh on every open
function FilterForm<TFieldValues extends FieldValues>({
  children,
  pluralFilteredItemName,
  handleSubmit,
  lastApplied,
  resetFieldValues,
}: FilterFormProps<TFieldValues>) {
  const close = useClose()
  const form = useForm<TFieldValues>({ defaultValues: lastApplied })
  const resetDisabled = countApplied(resetFieldValues, lastApplied) === 0

  return (
    <form
      aria-label={`Filter ${pluralFilteredItemName}`}
      className="py-4"
      onSubmit={form.handleSubmit((form: TFieldValues) => {
        handleSubmit(form)
        close()
      })}
    >
      <div className="flex items-start justify-between px-4">
        <h2 className="text-sans-semi-md text-raise">Filter {pluralFilteredItemName}</h2>
        <button
          type="button"
          className={cn(
            resetDisabled ? 'text-disabled' : 'text-default hover:text-raise',
            'text-mono-sm flex items-center'
          )}
          disabled={resetDisabled}
          onClick={() => {
            handleSubmit(resetFieldValues)
            close()
          }}
        >
          Reset
        </button>
      </div>
      <Divider className="mt-2" />
      <div className="mt-6 gap-4 px-4">{children(form)}</div>
      <div className="mt-6 flex justify-end px-4">
        <Button type="submit">Apply</Button>
      </div>
    </form>
  )
}
