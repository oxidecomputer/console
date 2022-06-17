import { useApiQuery } from '@oxide/api'
import { PageHeader, PageTitle, Terminal24Icon } from '@oxide/ui'
import { MiB } from '@oxide/util'

import { Terminal } from 'app/components/Terminal'
import { useParams } from 'app/hooks'

export function SerialConsolePage() {
  const { orgName, projectName, instanceName } = useParams(
    'orgName',
    'projectName',
    'instanceName'
  )

  const { data } = useApiQuery('projectInstancesInstanceSerialGet', {
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
      <Terminal data={data?.data} />
    </>
  )
}

export default SerialConsolePage
