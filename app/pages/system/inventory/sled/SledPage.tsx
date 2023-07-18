import fileSize from 'filesize'
import type { LoaderFunctionArgs } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { apiQueryClient, useApiQuery } from '@oxide/api'
import { PageHeader, PageTitle, PropertiesTable, Racks24Icon } from '@oxide/ui'

import { RouteTabs, Tab } from 'app/components/RouteTabs'
import { requireSledParams, useSledParams } from 'app/hooks'
import { pb } from 'app/util/path-builder'

SledPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { sledId } = requireSledParams(params)
  await apiQueryClient.prefetchQuery('sledView', {
    path: { sledId },
  })
  return null
}

export function SledPage() {
  const { sledId } = useSledParams()
  const { data: sled } = useApiQuery('sledView', { path: { sledId } })

  invariant(sled, 'sled should be prefetched')

  const ram = fileSize(sled.usablePhysicalRam, { output: 'object', base: 2 })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Racks24Icon />}>Sled</PageTitle>
      </PageHeader>

      <PropertiesTable.Group className="-mt-8 mb-16">
        <PropertiesTable>
          <PropertiesTable.Row label="sled id">
            <span className="text-secondary">{sled.id}</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="part">
            <span className="text-secondary">{sled.baseboard.part}</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="serial">
            <span className="text-secondary">{sled.baseboard.serial}</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="revision">
            <span className="text-secondary">{sled.baseboard.revision}</span>
          </PropertiesTable.Row>
        </PropertiesTable>
        <PropertiesTable>
          <PropertiesTable.Row label="rack id">
            <span className="text-secondary">{sled.rackId}</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="location">
            <span className="text-disabled">Coming soon</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="usable hardware threads">
            <span className="text-secondary">{sled.usableHardwareThreads}</span>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="usable physical ram">
            <span className="pr-0.5 text-secondary">{ram.value}</span>
            <span className="text-quaternary">{ram.unit}</span>
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>

      <RouteTabs fullWidth>
        <Tab to={pb.sledInstances({ sledId })}>Instances</Tab>
      </RouteTabs>
    </>
  )
}
