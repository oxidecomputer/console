/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { filesize } from 'filesize'
import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import { Servers24Icon } from '@oxide/design-system/icons/react'

import { RouteTabs, Tab } from '~/components/RouteTabs'
import { requireSledParams, useSledParams } from '~/hooks/use-params'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { pb } from '~/util/path-builder'

export async function loader({ params }: LoaderFunctionArgs) {
  const { sledId } = requireSledParams(params)
  await apiQueryClient.prefetchQuery('sledView', {
    path: { sledId },
  })
  return null
}

Component.displayName = 'SledPage'
export function Component() {
  const { sledId } = useSledParams()
  const { data: sled } = usePrefetchedApiQuery('sledView', { path: { sledId } })

  const ram = filesize(sled.usablePhysicalRam, { output: 'object', base: 2 })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Servers24Icon />}>Sled</PageTitle>
      </PageHeader>

      <PropertiesTable.Group className="-mt-8 mb-16">
        <PropertiesTable>
          <PropertiesTable.Row label="sled id">
            <span className="text-default">{sled.id}</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="part">
            <span className="text-default">{sled.baseboard.part}</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="serial">
            <span className="text-default">{sled.baseboard.serial}</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="revision">
            <span className="text-default">{sled.baseboard.revision}</span>
          </PropertiesTable.Row>
        </PropertiesTable>
        <PropertiesTable>
          <PropertiesTable.Row label="rack id">
            <span className="text-default">{sled.rackId}</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="location">
            <span className="text-disabled">Coming soon</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="usable hardware threads">
            <span className="text-default">{sled.usableHardwareThreads}</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="usable physical ram">
            <span className="pr-0.5 text-default">{ram.value}</span>
            <span className="text-tertiary">{ram.unit}</span>
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>

      <RouteTabs fullWidth>
        <Tab to={pb.sledInstances({ sledId })}>Instances</Tab>
      </RouteTabs>
    </>
  )
}
