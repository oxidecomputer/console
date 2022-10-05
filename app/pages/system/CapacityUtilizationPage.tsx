import { useMemo } from 'react'

import { apiQueryClient, useApiQuery } from '@oxide/api'
import { Divider, Listbox, PageHeader, PageTitle, Snapshots24Icon } from '@oxide/ui'

CapacityUtilizationPage.loader = async () => {
  await apiQueryClient.prefetchQuery('siloList', {})
}

export function CapacityUtilizationPage() {
  const { data: silos } = useApiQuery('siloList', {})

  const siloItems = useMemo(
    () => silos?.items.map((silo) => ({ label: silo.name, value: silo.id })) || [],
    [silos]
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Snapshots24Icon />}>Capacity &amp; Utilization</PageTitle>
      </PageHeader>
      <Listbox items={siloItems} placeholder="Filter by silo" />
      <Divider className="my-6" />
    </>
  )
}
