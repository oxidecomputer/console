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
import { EmptyCell } from '~/table/cells/EmptyCell'
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
      aria-label="Properties table"
      className={cn(
        className,
        'properties-table border-default min-w-min basis-6/12 rounded-lg border',
        '*:border-secondary *:border-t *:pr-6 *:pl-3 [&>*:nth-child(-n+2)]:border-t-0!',
        'grid grid-cols-[minmax(min-content,1fr)_3fr]',
        {
          '1000:grid-cols-[minmax(min-content,1fr)_3fr_minmax(min-content,1fr)_3fr] 1000:[&>*:nth-child(-n+4)]:border-t-0! 1000:[&>*:nth-child(4n-2)]:border-r':
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
    <span className="text-mono-sm text-secondary flex items-center whitespace-nowrap">
      {label}
    </span>
    <div className="text-sans-md text-default flex h-[38px] items-center overflow-hidden pr-4 whitespace-nowrap">
      {children}
    </div>
  </>
)

PropertiesTable.IdRow = ({ id, label = 'ID' }: { id?: string | null; label?: string }) => (
  <PropertiesTable.Row label={label}>
    {id ? <Truncate text={id} maxLength={32} hasCopyButton /> : <EmptyCell />}
  </PropertiesTable.Row>
)

PropertiesTable.DescriptionRow = ({
  description,
  sideModal,
}: {
  description: string
  sideModal?: boolean
}) => (
  <PropertiesTable.Row label="Description">
    <DescriptionCell text={description} sideModal={sideModal} />
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
