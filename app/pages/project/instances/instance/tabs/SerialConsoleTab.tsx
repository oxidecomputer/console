import { Suspense, lazy } from 'react'

import { useApiQuery } from '@oxide/api'
import { Button } from '@oxide/ui'
import { MiB } from '@oxide/util'

import { PageActions } from 'app/components/PageActions'
import { useInstanceSelector } from 'app/hooks'

const Terminal = lazy(() => import('app/components/Terminal'))

export function SerialConsoleTab() {
  const { organization, project, instance } = useInstanceSelector()

  const { data, refetch } = useApiQuery(
    'instanceSerialConsoleV1',
    {
      path: { instance },
      // holding off on using toPathQuery for now because it doesn't like numbers
      query: { organization, project, maxBytes: 10 * MiB, fromStart: 0 },
    },
    { refetchOnWindowFocus: false }
  )

  return (
    <>
      <div className="relative -mb-10 !w-[calc(100%-var(--content-gutter))]">
        <Suspense fallback={<></>}>
          <Terminal className="mb-2 w-full" data={data?.data} />
        </Suspense>
      </div>
      <PageActions>
        <div className="gutter flex h-20 items-center">
          <Button size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </PageActions>
    </>
  )
}
