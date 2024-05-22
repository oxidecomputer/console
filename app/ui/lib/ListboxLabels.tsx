/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { filesize } from 'filesize'

import { useApiQuery, type FloatingIp, type Image, type Snapshot } from '~/api'
import { toLocaleDateString } from '~/util/date'
import { bytesToGiB } from '~/util/units'

import { Badge } from './Badge'
import { Slash } from './Slash'

export const FloatingIpLabel = ({ ip }: { ip: FloatingIp }) => (
  <div>
    <div>{ip.name}</div>
    <div className="flex gap-0.5 text-tertiary selected:text-accent-secondary">
      <div>{ip.ip}</div>
      {ip.description && (
        <>
          <Slash />
          <div className="grow overflow-hidden overflow-ellipsis whitespace-pre text-left">
            {ip.description}
          </div>
        </>
      )}
    </div>
  </div>
)

export const ImageLabel = ({
  image,
  includeProjectSiloIndicator,
}: {
  image: Image
  includeProjectSiloIndicator: boolean
}) => {
  const { name, os, projectId, size, version } = image
  const formattedSize = `${bytesToGiB(size, 1)} GiB`

  // for metadata showing in the dropdown's options, include the project / silo indicator if requested
  const projectSiloIndicator = includeProjectSiloIndicator
    ? `${projectId ? 'Project' : 'Silo'} image`
    : null

  // filter out undefined metadata here, as well, and create a `<Slash />`-separated list
  // for the listbox item (shown for each item in the dropdown)
  const metadataForLabel = [os, version, formattedSize, projectSiloIndicator]
    .filter((i) => !!i)
    .map((i, index) => (
      <span key={`${i}`}>
        {index > 0 ? <Slash /> : ''}
        {i}
      </span>
    ))

  return (
    <>
      <div>{name}</div>
      <div className="text-tertiary selected:text-accent-secondary">{metadataForLabel}</div>
    </>
  )
}

export const selectedImageLabel = (image: Image) => {
  const { name, os, size, version } = image
  const formattedSize = `${bytesToGiB(size, 1)} GiB`

  // filter out any undefined metadata and create a comma-separated list
  // for the selected listbox item (shown in selectedLabel)
  const condensedImageMetadata = [os, version, formattedSize].filter((i) => !!i).join(', ')
  const metadataForSelectedLabel = condensedImageMetadata.length
    ? ` (${condensedImageMetadata})`
    : ''

  return `${name}${metadataForSelectedLabel}`
}

export const PoolLabel = ({ pool }: { pool: { name: string; isDefault: boolean } }) => (
  <div className="flex items-center gap-2">
    {pool.name}
    {pool.isDefault && <Badge>default</Badge>}
  </div>
)

const DiskNameFromId = ({ disk }: { disk: string }) => {
  const { data, isPending, isError } = useApiQuery(
    'diskView',
    { path: { disk } },
    // this can 404 if the source disk has been deleted, and that's fine
    { throwOnError: false }
  )

  if (isPending || isError) return null
  return <> from {data.name}</>
}

export const SnapshotLabel = ({ snapshot }: { snapshot: Snapshot }) => {
  const formattedSize = filesize(snapshot.size, { base: 2, output: 'object' })

  return (
    <>
      <div>{snapshot.name}</div>
      <div className="flex gap-0.5 text-tertiary selected:text-accent-secondary">
        <span>Created on {toLocaleDateString(snapshot.timeCreated)}</span>
        <DiskNameFromId disk={snapshot.diskId} />
        <Slash />
        <span>
          {formattedSize.value} {formattedSize.unit}
        </span>
      </div>
    </>
  )
}
