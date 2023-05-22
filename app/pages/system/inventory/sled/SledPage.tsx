import type { LoaderFunctionArgs } from 'react-router-dom'

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

  if (!sled) return null

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Racks24Icon />}>Sled 0</PageTitle>
      </PageHeader>

      <PropertiesTable.Group className="mb-16 -mt-8">
        <PropertiesTable>
          <PropertiesTable.Row label="sled uuid">
            <span className="text-secondary">{sled.id}</span>
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>

      <RouteTabs fullWidth>
        <Tab to={pb.sledInstances({ sledId })}>Instances</Tab>
      </RouteTabs>
    </>
  )
}
