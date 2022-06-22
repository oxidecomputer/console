import { Suspense } from 'react'
import React from 'react'

import { useApiQuery } from '@oxide/api'
import { Button, PageHeader, PageTitle, Terminal24Icon } from '@oxide/ui'
import { MiB } from '@oxide/util'

import { PageActions } from 'app/components/PageActions'
import { useParams } from 'app/hooks'

export function SerialConsolePage() {
  const Terminal = React.lazy(() => import('app/components/Terminal'))
  const { orgName, projectName, instanceName } = useParams(
    'orgName',
    'projectName',
    'instanceName'
  )

  const { data, refetch } = useApiQuery('projectInstancesInstanceSerialGet', {
    maxBytes: 10 * MiB,
    fromStart: 0,
    orgName,
    projectName,
    instanceName,
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Terminal24Icon />}>Serial Console</PageTitle>
      </PageHeader>
      <Suspense fallback={<>Loading</>}>
        <Terminal data={data?.data} />
      </Suspense>
      <PageActions>
        <div className="flex h-20 items-center">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </PageActions>
    </>
  )
}
