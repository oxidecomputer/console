import { useMemo } from 'react'
import invariant from 'tiny-invariant'

import { apiQueryClient, useApiQuery } from '@oxide/api'
import { PageHeader, PageTitle, Snapshots24Icon } from '@oxide/ui'

import { UtilizationPage } from './system/CapacityUtilizationPage'

const toListboxItem = (x: { name: string; id: string }) => ({ label: x.name, value: x.id })

SiloUtilizationPage.loader = async () => {
  await Promise.all([
    apiQueryClient.prefetchQuery('projectList', {}),
    ...UtilizationPage.getLoaderPromises(),
  ])
  return null
}

export function SiloUtilizationPage() {
  // this will come from /session/me
  const { data: me } = useApiQuery('currentUserView', {})
  invariant(me, 'Current user should be prefetched')

  const siloId = me.siloId

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
