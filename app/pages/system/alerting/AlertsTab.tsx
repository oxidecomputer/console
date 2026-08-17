/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import { memo, useState } from 'react'

import { api, getListQFn, queryClient, snakeify, type Alert } from '@oxide/api'
import { Webhooks24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { EmptyCell } from '~/table/cells/EmptyCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { Button } from '~/ui/lib/Button'
import { CopyToClipboard } from '~/ui/lib/CopyToClipboard'
import { DateTime } from '~/ui/lib/DateTime'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { SideModal } from '~/ui/lib/SideModal'
import { TableEmptyBox } from '~/ui/lib/Table'

export const handle = { crumb: 'Alerts' }

const alertList = getListQFn(api.alertList, { query: { sortBy: 'time_and_id_descending' } })

export async function clientLoader() {
  await queryClient.prefetchQuery(alertList.optionsFn())
  return null
}

const colHelper = createColumnHelper<Alert>()
const staticCols = [
  colHelper.accessor('class', {
    cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
  }),
  colHelper.accessor('timeCreated', Columns.timeCreated),
  colHelper.accessor(
    (alert: Alert) =>
      alert.timeCreated.getTime() === alert.timeModified.getTime()
        ? undefined
        : alert.timeModified,
    {
      header: 'modified',
      cell: (info) => {
        const value: Date | undefined = info.getValue()
        return value === undefined ? <EmptyCell /> : <DateTime date={value} />
      },
    }
  ),
]

function AlertDetail({ alert, onDismiss }: { alert: Alert; onDismiss: () => void }) {
  return (
    <SideModal
      isOpen
      onDismiss={onDismiss}
      title="Alert details"
      subtitle={<Badge color="neutral">{alert.class}</Badge>}
    >
      <SideModal.Body>
        <SideModal.Section>
          <PropertiesTable>
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
        </SideModal.Section>
      </SideModal.Body>
      <SideModal.Footer>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Close
        </Button>
      </SideModal.Footer>
    </SideModal>
  )
}

const ApiResponseViewer = memo(({ body }: { body: Record<string, unknown> }) => {
  const stringified = JSON.stringify(snakeify(body), null, 2)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SideModal.Heading>Alert body</SideModal.Heading>
        <CopyToClipboard text={stringified} ariaLabel="Copy alert body" />
      </div>
      <pre className="text-mono-md border-secondary bg-default w-full overflow-x-auto rounded-md border px-4 py-3 tracking-normal! normal-case!">
        {stringified}
      </pre>
    </div>
  )
})

export default function AlertsTab() {
  const [detail, setDetail] = useState<Alert | null>(null)
  const makeActions = (alert: Alert): MenuAction[] => [
    {
      label: 'View alert details',
      onActivate() {
        setDetail(alert)
      },
    },
  ]
  const columns = useColsWithActions(staticCols, makeActions)
  const { table } = useQueryTable({
    query: alertList,
    columns,
    emptyState: (
      <TableEmptyBox>
        <EmptyMessage
          icon={<Webhooks24Icon />}
          title="No alerts"
          body="Alerts created by the system will appear here."
        />
      </TableEmptyBox>
    ),
  })

  return (
    <>
      {table}
      {detail && <AlertDetail alert={detail} onDismiss={() => setDetail(null)} />}
    </>
  )
}
