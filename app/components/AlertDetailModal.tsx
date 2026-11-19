/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { Alert } from '@oxide/api'

import { AlertClassBadge } from '~/components/AlertClassBadge'
import { AlertPayload } from '~/components/AlertPayload'
import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { DateTime } from '~/ui/lib/DateTime'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'

type Props = {
  alert: Alert
  onDismiss: () => void
  animate?: boolean
}

export function AlertDetailModal({ alert, onDismiss, animate }: Props) {
  return (
    <ReadOnlySideModalForm title="Alert details" onDismiss={onDismiss} animate={animate}>
      <PropertiesTable>
        <PropertiesTable.Row label="Class">
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
          {alert.version}
        </PropertiesTable.Row>
        <PropertiesTable.IdRow id={alert.id} label="ID" />
        {/* no Modified row: nothing in Nexus updates an alert after insert, so
            time_modified always equals time_created */}
        <PropertiesTable.Row label="Created">
          <DateTime date={alert.timeCreated} />
        </PropertiesTable.Row>
      </PropertiesTable>
      <AlertPayload payload={alert.payload} />
    </ReadOnlySideModalForm>
  )
}
