import { useMemo } from 'react'

import { apiQueryClient, useApiQuery } from '@oxide/api'
import { PageHeader, PageTitle, Snapshots24Icon } from '@oxide/ui'

import { UtilizationPage } from './system/CapacityUtilizationPage'

const DEFAULT_SILO_ID = '001de000-5110-4000-8000-000000000000'

const toListboxItem = (x: { name: string; id: string }) => ({ label: x.name, value: x.id })

SiloUtilizationPage.loader = async () => {
  await apiQueryClient.prefetchQuery('projectList', {})
  return null
}

export function SiloUtilizationPage() {
  // this will come from /session/me
  const siloId = DEFAULT_SILO_ID

  const { data: projects } = useApiQuery('projectList', {})

  const projectItems = useMemo(() => {
    const items = projects?.items.map(toListboxItem) || []
    return [{ label: 'All projects', value: siloId }, ...items]
  }, [projects, siloId])

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Snapshots24Icon />}>Capacity &amp; Utilization</PageTitle>
      </PageHeader>

      <UtilizationPage filterItems={projectItems} defaultId={siloId} />
    </>
  )
}
