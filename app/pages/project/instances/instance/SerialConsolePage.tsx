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
    { maxBytes: 10 * MiB, fromStart: 0, ...instanceParams },
    { refetchOnWindowFocus: false }
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Terminal24Icon />}>Serial Console</PageTitle>
      </PageHeader>
      <Divider className="!m-0 !w-full !-mt-12" />
      <Suspense fallback={<>Loading</>}>
        <Terminal className="w-full h-full -mb-10 mt-1" data={data?.data} />
      </Suspense>
      <PageActions>
        <div className="flex h-20 items-center gutter">
          <Button variant="default" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </PageActions>
    </>
  )
}
