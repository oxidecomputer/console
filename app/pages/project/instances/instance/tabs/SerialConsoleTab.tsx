import { Suspense, lazy } from 'react'

import { useApiQuery } from '@oxide/api'
import { Button } from '@oxide/ui'
import { MiB } from '@oxide/util'

import { PageActions } from 'app/components/PageActions'
import { useParams } from 'app/hooks'

const Terminal = lazy(() => import('app/components/Terminal'))

export function SerialConsoleTab() {
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
      <div className="-mb-10 !w-[calc(100%-var(--content-gutter))] relative">
        <Suspense fallback={<>Loading</>}>
          <Terminal className="mb-2 w-full" data={data?.data} />
        </Suspense>
      </div>
      <PageActions>
        <div className="flex h-20 items-center">
          <Button variant="default" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </PageActions>
    </>
  )
}
