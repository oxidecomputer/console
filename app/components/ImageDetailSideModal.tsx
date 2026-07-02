/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type Image } from '@oxide/api'
import { Images16Icon } from '@oxide/design-system/icons/react'

import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { docLinks } from '~/util/links'

type ImageDetailSideModalProps = {
  image: Image
  onDismiss: () => void
  /** Pass `true` for state-driven usage (e.g., DiskSourceCell). Omit for route usage. */
  animate?: boolean
}

export function ImageDetailSideModal({
  image,
  onDismiss,
  animate,
}: ImageDetailSideModalProps) {
  // projectId is only set on project images; silo images leave it null
  const visibility = image.projectId ? 'Project' : 'Silo'
  return (
    <ReadOnlySideModalForm
      title="Image details"
      onDismiss={onDismiss}
      animate={animate}
      subtitle={
        <ResourceLabel>
          <Images16Icon /> {image.name}
        </ResourceLabel>
      }
    >
      <PropertiesTable>
        <PropertiesTable.IdRow id={image.id} />
        <PropertiesTable.DescriptionRow description={image.description} sideModal />
        <PropertiesTable.Row label="Visibility">{visibility}</PropertiesTable.Row>
        <PropertiesTable.Row label="OS">{image.os}</PropertiesTable.Row>
        <PropertiesTable.Row label="Version">{image.version}</PropertiesTable.Row>
        <PropertiesTable.SizeRow bytes={image.size} />
        <PropertiesTable.Row label="Block size">
          {image.blockSize.toLocaleString()} bytes
        </PropertiesTable.Row>
        <PropertiesTable.DateRow label="Created" date={image.timeCreated} />
        <PropertiesTable.DateRow label="Last Modified" date={image.timeModified} />
      </PropertiesTable>
      <SideModalFormDocs docs={[docLinks.images]} />
    </ReadOnlySideModalForm>
  )
}
