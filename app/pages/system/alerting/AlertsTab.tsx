/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import cn from 'classnames'
import { memo, useMemo, useState } from 'react'

import { api, getListQFn, queryClient, snakeify, type Alert } from '@oxide/api'
import { Webhooks24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { AlertClassBadge } from '~/components/AlertClassBadge'
import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { HighlightJSON } from '~/components/HighlightJSON'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { usePaginatedList } from '~/table/QueryTable'
import { CopyToClipboard } from '~/ui/lib/CopyToClipboard'
import { DateTime, SyslogDateTime } from '~/ui/lib/DateTime'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { SideModal } from '~/ui/lib/SideModal'
import { TableEmptyBox } from '~/ui/lib/Table'
import { Truncate } from '~/ui/lib/Truncate'
import { roleDiv } from '~/util/classed'

export const handle = { crumb: 'Alerts' }

const alertList = getListQFn(api.alertList, { query: { sortBy: 'time_and_id_descending' } })

export async function clientLoader() {
  await queryClient.prefetchQuery(alertList.optionsFn())
  return null
}

/*
 * A log-style list like the audit log rather than a resource table: fixed-width
 * columns on the left and the payload filling whatever is left. Flex layout
 * strips the implicit semantics of table elements, so like MiniTable this is
 * divs with explicit ARIA table roles.
 */
const Table = roleDiv('table', 'text-sans-md')
const Row = roleDiv('row', 'flex items-center gap-8 border-secondary border-b')
const HeadCell = roleDiv('columnheader', 'text-mono-sm text-tertiary')
const Cell = roleDiv('cell', '')

// Header and body cells share these so the columns line up. The payload and
// ID columns drop out first as the tab panel (a container) narrows.
const col = {
  time: 'w-31 shrink-0',
  id: 'w-32.5 shrink-0 @max-[600px]:hidden',
  // wide enough for the current classes, e.g. hardware.power_shelf.psu.insert
  class: 'w-72 shrink-0',
  payload: 'min-w-0 flex-1 @max-[800px]:hidden',
}

const getId = (alert: Alert) => alert.id

type AlertRowProps = {
  alert: Alert
  selected: boolean
  onSelect: (alert: Alert) => void
}

// memoized so opening the detail for one row doesn't re-render the JSON
// preview in every other row
const AlertRow = memo(function AlertRow({ alert, selected, onSelect }: AlertRowProps) {
  // stable object identity so HighlightJSON's memo holds across re-renders
  const payload = useMemo(() => snakeify(alert.alert), [alert])
  const hasPayload = Object.keys(alert.alert).length > 0

  return (
    // The row itself is the click target, like the audit log. Keyboard and
    // screen reader users get the visually hidden button in the first cell,
    // which the row's focus ring reflects.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <Row
      className={cn(
        'h-9 cursor-pointer focus-within:rounded-md focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-accent-secondary',
        selected ? 'bg-hover' : 'hover:bg-raise'
      )}
      onClick={() => onSelect(alert)}
    >
      <Cell className={col.time}>
        <button type="button" className="sr-only" onClick={() => onSelect(alert)}>
          View alert details
        </button>
        <SyslogDateTime date={alert.timeCreated} />
      </Cell>
      <Cell className={cn(col.id, 'text-secondary')}>
        <Truncate text={alert.id} position="middle" hasCopyButton />
      </Cell>
      <Cell className={col.class}>
        <AlertClassBadge>{alert.class}</AlertClassBadge>
      </Cell>
      <Cell
        className={cn(
          col.payload,
          'text-mono-sm overflow-hidden text-ellipsis whitespace-nowrap normal-case! tracking-normal!'
        )}
      >
        {hasPayload ? <HighlightJSON json={payload} inline /> : <EmptyCell />}
      </Cell>
    </Row>
  )
})

function AlertDetail({ alert, onDismiss }: { alert: Alert; onDismiss: () => void }) {
  return (
    <ReadOnlySideModalForm title="Alert details" onDismiss={onDismiss} animate>
      <PropertiesTable>
        <PropertiesTable.Row label="Alert class">
          <AlertClassBadge>{alert.class}</AlertClassBadge>
        </PropertiesTable.Row>
        <PropertiesTable.Row
          // TODO: explain this in the info bubble or column header. doc comment below
          //
          // Alert schemas are versioned on a per-alert-class basis. The schema version
          // for a particular alert class does not correspond to an Oxide API version.
          // Clients should expect to encounter earlier schema versions when retrieving
          // alerts recorded by an earlier version of the system software.
          label="Class version"
        >
          <Badge color="neutral">{alert.version}</Badge>
        </PropertiesTable.Row>
        <PropertiesTable.IdRow id={alert.id} label="Alert ID" />
        <PropertiesTable.Row label="Created">
          <DateTime date={alert.timeCreated} />
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Modified">
          <DateTime date={alert.timeModified} />
        </PropertiesTable.Row>
      </PropertiesTable>
      <ApiResponseViewer body={alert.alert} />
    </ReadOnlySideModalForm>
  )
}

const ApiResponseViewer = memo(({ body }: { body: Record<string, unknown> }) => {
  // recomputing on every render would hand HighlightJSON a new object each
  // time and defeat its memo
  const snakeJson = useMemo(() => snakeify(body), [body])
  const stringified = useMemo(() => JSON.stringify(snakeJson, null, 2), [snakeJson])
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SideModal.Heading>Alert body</SideModal.Heading>
        <CopyToClipboard text={stringified} ariaLabel="Copy alert body" />
      </div>
      <div className="bg-raise border-secondary overflow-x-auto rounded border px-3 py-2">
        <pre className="text-mono-code [font-size:13px]! [line-height:18px]!">
          <HighlightJSON json={snakeJson} />
        </pre>
      </div>
    </div>
  )
})

export default function AlertsTab() {
  const [detail, setDetail] = useState<Alert | null>(null)
  const { items, isEmpty, pagination } = usePaginatedList(alertList, getId)

  if (isEmpty) {
    return (
      <TableEmptyBox>
        <EmptyMessage
          icon={<Webhooks24Icon />}
          title="No alerts"
          body="Alerts created by the system will appear here."
        />
      </TableEmptyBox>
    )
  }

  return (
    <>
      <Table aria-label="Alerts">
        <Row className="pb-2">
          <HeadCell className={col.time}>Created</HeadCell>
          <HeadCell className={col.id}>Alert ID</HeadCell>
          <HeadCell className={col.class}>Alert class</HeadCell>
          <HeadCell className={col.payload}>Payload</HeadCell>
        </Row>
        {items.map((alert) => (
          <AlertRow
            key={alert.id}
            alert={alert}
            selected={detail?.id === alert.id}
            onSelect={setDetail}
          />
        ))}
      </Table>
      {pagination}
      {detail && <AlertDetail alert={detail} onDismiss={() => setDetail(null)} />}
    </>
  )
}
