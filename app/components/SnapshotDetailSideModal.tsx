/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type Snapshot } from '@oxide/api'
import { Snapshots16Icon } from '@oxide/design-system/icons/react'

import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { SnapshotStateBadge } from '~/components/StateBadge'
import { DiskNameFromId } from '~/table/cells/SourceNameCell'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { docLinks } from '~/util/links'

type SnapshotDetailSideModalProps = {
  snapshot: Snapshot
  onDismiss: () => void
}

export function SnapshotDetailSideModal({
  snapshot,
  onDismiss,
}: SnapshotDetailSideModalProps) {
  return (
    <ReadOnlySideModalForm
      title="Snapshot details"
      onDismiss={onDismiss}
      animate
      subtitle={
        <ResourceLabel>
          <Snapshots16Icon /> {snapshot.name}
        </ResourceLabel>
      }
    >
      <PropertiesTable>
        <PropertiesTable.IdRow id={snapshot.id} />
        <PropertiesTable.DescriptionRow description={snapshot.description} sideModal />
        <PropertiesTable.Row label="State">
          <SnapshotStateBadge state={snapshot.state} />
        </PropertiesTable.Row>
        <PropertiesTable.SizeRow bytes={snapshot.size} />
        <PropertiesTable.Row label="Source disk">
          <DiskNameFromId diskId={snapshot.diskId} />
        </PropertiesTable.Row>
        <PropertiesTable.DateRow label="Created" date={snapshot.timeCreated} />
        <PropertiesTable.DateRow label="Last Modified" date={snapshot.timeModified} />
      </PropertiesTable>
      <SideModalFormDocs docs={[docLinks.snapshots]} />
    </ReadOnlySideModalForm>
  )
}
