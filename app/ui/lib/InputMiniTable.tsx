/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import {
  useFieldArray,
  type Control,
  type FieldPath,
  type FieldValues,
  type PathValue,
} from 'react-hook-form'

import { Error16Icon } from '@oxide/design-system/icons/react'

import { Button } from './Button'
import { EMBody } from './EmptyMessage'

type InputMiniTableProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  headers: string[]
  name: TName
  control: Control<TFieldValues>
  renderRow: (
    field: Record<string, unknown> & { id: string },
    index: number,
    name: string
  ) => React.ReactNode[]
  emptyState?: { title: string; body: string }
  className?: string
  defaultValue: PathValue<TFieldValues, TName>[number]
  /**
   * Custom column widths using CSS Grid values. Defaults to equal width.
   * @example ['1fr', '2fr'] for 1/3 and 2/3 ratio
   */
  columnWidths?: string[]
}

export function InputMiniTable<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  headers,
  name,
  control,
  renderRow,
  emptyState,
  className,
  defaultValue,
  columnWidths,
}: InputMiniTableProps<TFieldValues, TName>) {
  const { fields, append, remove } = useFieldArray({
    control: control as Control<FieldValues>,
    name,
  })

  const hasItems = fields.length > 0
  const columnCount = headers.length + 1 // +1 for remove button column

  return (
    <div className={cn('w-full', className)}>
      {/* Grid Container */}
      <div
        className="grid overflow-hidden rounded-lg border pb-1 bg-default border-default"
        style={{
          gridTemplateColumns: columnWidths
            ? `${columnWidths.join(' ')} 2.25rem`
            : `repeat(${headers.length}, 1fr) 2.25rem`,
          borderSpacing: '0px',
        }}
      >
        {/* Header Row */}
        {headers.map((header, index) => (
          <div
            key={index}
            className="relative mb-1 flex h-9 items-center border-b pl-5 pr-3 text-left font-semibold text-mono-sm text-secondary bg-secondary border-default first:pl-3"
          >
            <div
              className={cn(
                "absolute top-0 z-10 h-full w-px bg-[var(--base-neutral-200)] content-['']",
                index === headers.length - 1 ? 'right-0' : '-right-1.5'
              )}
            />
            {header}
          </div>
        ))}
        {/* Header for remove button column */}
        <div className="mb-1 border-b bg-secondary border-default" />

        {/* Body Rows */}
        {hasItems ? (
          fields
            .map((field, rowIndex) => {
              const rowCells = renderRow(field, rowIndex, name)
              return rowCells
                .map((input, cellIndex) => (
                  <div
                    key={`${field.id}-${cellIndex}`}
                    style={{
                      gridColumn: cellIndex + 1,
                      gridRow: rowIndex + headers.length + 2, // +2 for header row and 1-indexed
                    }}
                  >
                    <div className={cn('ml-2 flex items-center py-1')}>
                      <div className="h-auto w-full flex-col border-0 [&>div]:w-full">
                        {input}
                      </div>
                    </div>
                  </div>
                ))
                .concat([
                  // Remove button cell
                  <div
                    key={`${field.id}-remove`}
                    className={cn('relative')}
                    style={{
                      gridColumn: columnCount,
                      gridRow: rowIndex + headers.length + 2,
                    }}
                  >
                    <div className="flex h-12 items-center justify-center border-none py-2">
                      <button
                        type="button"
                        onClick={() => remove(rowIndex)}
                        aria-label={`Remove item ${rowIndex + 1}`}
                        className="-m-2 flex items-center justify-center p-2 text-tertiary hover:text-secondary focus:text-secondary"
                      >
                        <Error16Icon aria-hidden focusable="false" />
                      </button>
                    </div>
                  </div>,
                ])
            })
            .flat()
        ) : emptyState ? (
          <div
            style={{
              gridColumn: `1 / ${columnCount + 1}`,
              gridRow: 2,
            }}
            className="flex items-center justify-center py-6"
          >
            <div className="flex max-w-[18rem] flex-col items-center text-center">
              <h3 className="text-sans-semi-md">{emptyState.title}</h3>
              <EMBody>{emptyState.body}</EMBody>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => append(defaultValue)}>
          Add item
        </Button>
      </div>
    </div>
  )
}
