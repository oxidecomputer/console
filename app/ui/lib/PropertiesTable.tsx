/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import type { ReactNode } from 'react'

import { DescriptionCell } from '~/table/cells/DescriptionCell'
import { isOneOf } from '~/util/children'
import { invariant } from '~/util/invariant'

import { DateTime } from './DateTime'
import { Truncate } from './Truncate'

export interface PropertiesTableProps {
  className?: string
  children: ReactNode
  columns?: 1 | 2
}

export function PropertiesTable({
  className,
  children,
  columns = 1,
}: PropertiesTableProps) {
  invariant(
    isOneOf(children, [
      PropertiesTable.Row,
      PropertiesTable.IdRow,
      PropertiesTable.DescriptionRow,
      PropertiesTable.DateRow,
    ]),
    'PropertiesTable only accepts specific Row components as children'
  )
  return (
    <div
      className={cn(
        className,
        'properties-table min-w-min basis-6/12 rounded-lg border border-default',
        'children:border-t children:pl-3 children:pr-6 children:border-secondary [&>*:nth-child(-n+2)]:!border-t-0',
        'grid grid-cols-[minmax(min-content,1fr)_3fr]',
        {
          'lg+:grid-cols-[minmax(min-content,1fr)_3fr_minmax(min-content,1fr)_3fr] lg+:[&>*:nth-child(-n+4)]:!border-t-0 lg+:[&>*:nth-child(4n-2)]:border-r':
            columns === 2,
        }
      )}
    >
      {children}
    </div>
  )
}

interface PropertiesTableRowProps {
  label: ReactNode
  children: ReactNode
}
PropertiesTable.Row = ({ label, children }: PropertiesTableRowProps) => (
  <>
    <span className="flex items-center whitespace-nowrap text-mono-sm text-secondary">
      {label}
    </span>
    <div className="flex h-[38px] items-center overflow-hidden whitespace-nowrap pr-4 text-sans-md text-default">
      {children}
    </div>
  </>
)

PropertiesTable.IdRow = ({ id }: { id: string }) => (
  <PropertiesTable.Row label="ID">
    <Truncate text={id} maxLength={32} hasCopyButton />
  </PropertiesTable.Row>
)

PropertiesTable.DescriptionRow = ({ description }: { description: string }) => (
  <PropertiesTable.Row label="Description">
    <DescriptionCell text={description} />
  </PropertiesTable.Row>
)

PropertiesTable.DateRow = ({
  date,
  label,
}: {
  date: Date
  label: 'Created' | 'Updated' | 'Last Modified'
}) => (
  <PropertiesTable.Row label={label}>
    <DateTime date={date} />
  </PropertiesTable.Row>
)
