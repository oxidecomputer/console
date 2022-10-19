import { Suspense } from 'react'
import React from 'react'

import { useApiQuery } from '@oxide/api'
import { Button, Divider, PageHeader, PageTitle, Terminal24Icon } from '@oxide/ui'
import { MiB } from '@oxide/util'

import { PageActions } from 'app/components/PageActions'
import { useRequiredParams } from 'app/hooks'

const Terminal = React.lazy(() => import('app/components/Terminal'))

export function SerialConsolePage() {
  const instanceParams = useRequiredParams('orgName', 'projectName', 'instanceName')

  const { data, refetch } = useApiQuery(
    'instanceSerialConsole',
    { path: instanceParams, query: { maxBytes: 10 * MiB, fromStart: 0 } },
    { refetchOnWindowFocus: false }
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Terminal24Icon />}>Serial Console</PageTitle>
      </PageHeader>
      <Divider className="!m-0 !-mt-12 !w-full" />
      <Suspense fallback={<>Loading</>}>
        <Terminal className="-mb-10 mt-1 h-full w-full" data={data?.data} />
      </Suspense>
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
