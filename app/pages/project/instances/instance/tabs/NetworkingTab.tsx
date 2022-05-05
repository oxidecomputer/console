import { useQueryTable } from '@oxide/table'
import { EmptyMessage, Networking24Icon } from '@oxide/ui'
import { useParams } from 'app/hooks'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No network interfaces"
    body="You need to create a network interface to be able to see it here"
    // TODO: can you even add NICs after instance create?
    // buttonText="New network interface"
    // buttonTo="new"
  />
)

export function NetworkingTab() {
  const instanceParams = useParams('orgName', 'projectName', 'instanceName')
  const { Table, Column } = useQueryTable('instanceNetworkInterfacesGet', instanceParams)
  return (
    <Table emptyState={<EmptyState />}>
      <Column id="name" />
      <Column id="description" />
      {/* TODO: mark v4 or v6 explicitly? */}
      <Column id="ip" />
    </Table>
  )
}
