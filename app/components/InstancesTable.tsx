import React from 'react'
import { Link } from 'react-router-dom'
import type { Row } from 'react-table'
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'
import filesize from 'filesize'

import type { Instance } from '@oxide/api'
import { instanceCan, useApiMutation, useApiQueryClient } from '@oxide/api'
import { More12Icon, Success16Icon } from '@oxide/ui'
import { usePagination, useParams, useToast } from '../hooks'
import { DateCell, useQueryTable, InstanceStatusCell } from '@oxide/table'
import { pick } from '@oxide/util'

const menuCol = {
  id: 'menu',
  Cell: ({ row }: { row: Row<Instance> }) => {
    const instance = row.original
    const instanceName = instance.name
    const { orgName, projectName } = useParams('orgName', 'projectName')

    const addToast = useToast()
    const queryClient = useApiQueryClient()
    const refetch = () =>
      queryClient.invalidateQueries('projectInstancesGet', {
        organizationName: orgName,
        projectName,
      })

    // TODO: if there are lots of places we use the same set of instance
    // actions, consider wrapping them up in a useInstanceActions hook. One
    // reason not to do that would be if the success callbacks need to be
    // different at each callsite. The resulting API would be worse than calling
    // the hooks individually
    const stopInstance = useApiMutation('projectInstancesInstanceStop', {
      onSuccess: () => {
        refetch()
        addToast({
          icon: <Success16Icon />,
          title: `Instance '${instanceName}' stopped.`,
          timeout: 5000,
        })
      },
    })

    const rebootInstance = useApiMutation('projectInstancesInstanceReboot', {
      onSuccess: refetch,
    })

    const deleteInstance = useApiMutation('projectInstancesDeleteInstance', {
      onSuccess: () => {
        refetch()
        addToast({
          icon: <Success16Icon />,
          title: `Instance '${instanceName}' deleted.`,
          timeout: 5000,
        })
      },
    })

    const instanceLookup = {
      organizationName: orgName,
      projectName,
      instanceName,
    }

    return (
      <Menu>
        <MenuButton>
          <More12Icon className="text-gray-200 mr-4" />
        </MenuButton>
        <MenuList className="TableControls">
          <MenuItem
            onSelect={() => stopInstance.mutate(instanceLookup)}
            disabled={!instanceCan.stop(instance)}
          >
            Stop
          </MenuItem>
          <MenuItem
            onSelect={() => rebootInstance.mutate(instanceLookup)}
            disabled={!instanceCan.reboot(instance)}
          >
            Reboot
          </MenuItem>
          <MenuItem
            onSelect={() => deleteInstance.mutate(instanceLookup)}
            disabled={!instanceCan.delete(instance)}
          >
            Delete
          </MenuItem>
        </MenuList>
      </Menu>
    )
  },
}

const PAGE_SIZE = 10

export const InstancesTable = ({ className }: { className?: string }) => {
  const { currentPage } = usePagination()

  const { orgName, projectName } = useParams('orgName', 'projectName')

  const { Table, Column } = useQueryTable(
    'projectInstancesGet',
    {
      organizationName: orgName,
      projectName,
      pageToken: currentPage,
      limit: PAGE_SIZE,
    },
    { refetchInterval: 5000, keepPreviousData: true }
  )

  return (
    <div className={className}>
      <Table selectable debug>
        <Column id="name" />
        <Column
          id="resources"
          header="CPU, Ram"
          // TODO: Clean this up w/ a dedicated cell
          accessor={(instance) =>
            `${instance.ncpus} vCPU / ${filesize(instance.memory).replace(
              ' ',
              ''
            )} SSD`
          }
        />
        <Column
          id="status"
          accessor={(instance) =>
            pick(instance, 'runState', 'timeRunStateUpdated')
          }
          cell={InstanceStatusCell}
        />
        <Column id="created" accessor="timeCreated" cell={DateCell} />
      </Table>
    </div>
  )
}
