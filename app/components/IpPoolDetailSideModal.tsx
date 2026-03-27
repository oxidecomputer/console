/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type IpPool } from '@oxide/api'
import { IpGlobal16Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { IpVersionBadge } from '~/components/IpVersionBadge'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'

type IpPoolDetailSideModalProps = {
  pool: IpPool
  onDismiss: () => void
}

export function IpPoolDetailSideModal({ pool, onDismiss }: IpPoolDetailSideModalProps) {
  return (
    <ReadOnlySideModalForm
      title="IP pool details"
      onDismiss={onDismiss}
      animate
      subtitle={
        <ResourceLabel>
          <IpGlobal16Icon /> {pool.name}
        </ResourceLabel>
      }
    >
      <PropertiesTable>
        <PropertiesTable.IdRow id={pool.id} />
        <PropertiesTable.DescriptionRow description={pool.description} sideModal />
        <PropertiesTable.Row label="IP version">
          <IpVersionBadge ipVersion={pool.ipVersion} />
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Pool type">
          <Badge color="neutral">{pool.poolType}</Badge>
        </PropertiesTable.Row>
        <PropertiesTable.DateRow label="Created" date={pool.timeCreated} />
        <PropertiesTable.DateRow label="Last Modified" date={pool.timeModified} />
      </PropertiesTable>
    </ReadOnlySideModalForm>
  )
}
