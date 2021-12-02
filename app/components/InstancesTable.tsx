import React from 'react'
import { Link } from 'react-router-dom'
import type { Row } from 'react-table'
import { useTable, useRowSelect } from 'react-table'
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'
import filesize from 'filesize'

import type { Instance } from '@oxide/api'
import {
  instanceCan,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
} from '@oxide/api'
import { classed, More12Icon, Success16Icon } from '@oxide/ui'
import { Table, getSelectCol } from '@oxide/table'
import { StatusBadge } from './StatusBadge'
import { timeAgoAbbr } from '../util/date'
import { usePagination, useParams, useToast } from '../hooks'

const columns = [
  {
    accessor: 'name' as const,
    Header: () => <div className="text-left">Name</div>,
    Cell: ({ value }: { value: string }) => {
      // TODO: is it weird to pull directly from params here and in the menu
      // column? seems easier than passing it in somehow
      const { orgName, projectName } = useParams('orgName', 'projectName')
      return (
        <Link
          className="text-green-500"
          to={`/orgs/${orgName}/projects/${projectName}/instances/${value}`}
        >
          {value}
        </Link>
      )
    },
  },
  {
    accessor: (i: Instance) => ({ ncpus: i.ncpus, memory: i.memory }),
    id: 'resources',
    Header: () => <div className="text-left">CPU / RAM</div>,
    Cell: ({ value }: { value: Pick<Instance, 'ncpus' | 'memory'> }) =>
      `${value.ncpus} vCPU, ${filesize(value.memory)}`,
  },
  {
    accessor: (i: Instance) => ({
      runState: i.runState,
      timeRunStateUpdated: i.timeRunStateUpdated,
    }),
    id: 'status',
    Header: () => <div className="text-left">Status</div>,
    Cell: ({
      value,
    }: {
      value: Pick<Instance, 'runState' | 'timeRunStateUpdated'>
    }) => (
      <span className="inline-flex">
        <StatusBadge className="mr-2" status={value.runState} />
        <abbr
          className="text-xs !no-underline"
          title={value.timeRunStateUpdated.toLocaleString()}
        >
          {timeAgoAbbr(value.timeRunStateUpdated)}
        </abbr>
      </span>
    ),
  },
  {
    accessor: 'timeCreated' as const,
    Header: () => <div className="text-left">Created</div>,
    Cell: ({ value }: { value: Date }) => value.toLocaleString(),
  },
]

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

const PageButton = classed.button`text-gray-100 hover:text-gray-50 disabled:text-gray-200 disabled:cursor-default`

export const InstancesTable = ({ className }: { className?: string }) => {
  const { currentPage, goToNextPage, goToPrevPage, hasPrev } = usePagination()

  const { orgName, projectName } = useParams('orgName', 'projectName')
  const { data: instances } = useApiQuery(
    'projectInstancesGet',
    {
      organizationName: orgName,
      projectName,
      pageToken: currentPage,
      limit: PAGE_SIZE,
    },
    { refetchInterval: 5000, keepPreviousData: true }
  )

  const data = React.useMemo(() => instances?.items || [], [instances?.items])
  const table = useTable({ columns, data }, useRowSelect, (hooks) => {
    hooks.visibleColumns.push((columns) => [
      getSelectCol(),
      ...columns,
      menuCol,
    ])
  })

  if (!instances) return null

  // hasPrev check is there because the API doesn't leave off nextPage when
  // we're on the last page, so there's an empty page at the end we want to show
  // (until this is fixed)
  if (instances.items.length === 0 && !hasPrev) {
    return <div className={className}>No instances yet</div>
  }

  return (
    <div className={className}>
      <Table table={table} />
      <div className="mt-4 flex justify-between font-mono text-gray-100">
        <span className="text-xs uppercase">Rows per page: {PAGE_SIZE}</span>
        <span className="space-x-3 text-lg leading-none">
          <PageButton
            onClick={goToPrevPage}
            disabled={!hasPrev}
            aria-label="Previous"
          >
            {/* filled triangle left, outline triangle left */}
            {hasPrev ? '\u25C0' : '\u25C1'}
          </PageButton>
          <PageButton
            onClick={() =>
              instances.nextPage && goToNextPage(instances.nextPage)
            }
            disabled={!instances.nextPage}
            aria-label="Next"
          >
            {/* filled triangle right, outline triangle right */}
            {instances.nextPage ? '\u25B6' : '\u25B7'}
          </PageButton>
        </span>
      </div>
    </div>
  )
}
