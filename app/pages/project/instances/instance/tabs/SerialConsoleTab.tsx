import { Suspense, lazy } from 'react'

import { useApiQuery } from '@oxide/api'
import { Button } from '@oxide/ui'
import { MiB } from '@oxide/util'

import { PageActions } from 'app/components/PageActions'
import { useRequiredParams } from 'app/hooks'

const Terminal = lazy(() => import('app/components/Terminal'))

export function SerialConsoleTab() {
  const instanceParams = useRequiredParams('orgName', 'projectName', 'instanceName')

  const { data, refetch } = useApiQuery(
    'instanceSerialConsole',
    { path: instanceParams, query: { maxBytes: 10 * MiB, fromStart: 0 } },
    { refetchOnWindowFocus: false }
  )

  return (
    <>
      <div className="relative -mb-10 !w-[calc(100%-var(--content-gutter))]">
        <Suspense fallback={<>Loading</>}>
          <Terminal className="mb-2 w-full" data={data?.data} />
        </Suspense>
      </div>
      <PageActions>
        <div className="gutter flex h-20 items-center">
          <Button variant="default" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </PageActions>
    </>
  )
}
