import React from 'react'
import { useParams, Link } from 'react-router-dom'
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
import { classed, Icon, selectCol, Table } from '@oxide/ui'
import { StatusBadge } from './StatusBadge'
import { timeAgoAbbr } from '../util/date'
import { usePagination, useToast } from '../hooks'

const COLUMNS = [
  {
    accessor: 'name' as const,
    Header: () => <div className="text-left">Name</div>,
    Cell: ({ value }: { value: string }) => {
      // TODO: is it weird to pull directly from params here and in the menu
      // column? seems easier than passing it in somehow
      const { projectName } = useParams()
      return (
        <Link
          className="text-green-500"
          to={`/projects/${projectName}/instances/${value}`}
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
        <StatusBadge className="mr-2" size="sm" status={value.runState} />
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
    const addToast = useToast()
    const queryClient = useApiQueryClient()
    const refetch = () =>
      queryClient.invalidateQueries('projectInstancesGet', { projectName })

    const instance = row.original
    const instanceName = instance.name
    const { projectName } = useParams()

    // TODO: if there are lots of places we use the same set of instance
    // actions, consider wrapping them up in a useInstanceActions hook. One
    // reason not to do that would be if the success callbacks need to be
    // different at each callsite. The resulting API would be worse than calling
    // the hooks individually
    const stopInstance = useApiMutation('projectInstancesInstanceStop', {
      onSuccess: () => {
        refetch()
        addToast({
          icon: 'checkO',
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
          icon: 'checkO',
          title: `Instance '${instanceName}' deleted.`,
          timeout: 5000,
        })
      },
    })

    return (
      <Menu>
        <MenuButton>
          <Icon name="more" className="text-sm text-gray-200 mr-4" />
        </MenuButton>
        <MenuList className="TableControls">
          <MenuItem
            onSelect={() => stopInstance.mutate({ instanceName, projectName })}
            disabled={!instanceCan.stop(instance)}
          >
            Stop
          </MenuItem>
          <MenuItem
            onSelect={() =>
              rebootInstance.mutate({ instanceName, projectName })
            }
            disabled={!instanceCan.reboot(instance)}
          >
            Reboot
          </MenuItem>
          <MenuItem
            onSelect={() =>
              deleteInstance.mutate({ instanceName, projectName })
            }
            disabled={!instanceCan.delete(instance)}
          >
            Delete
          </MenuItem>
        </MenuList>
      </Menu>
    )
  },
}

const PAGE_SIZE = 3

const PageButton = classed.button`text-gray-100 hover:text-gray-50 disabled:text-gray-200 disabled:cursor-default`

export const InstancesTable = ({ className }: { className?: string }) => {
  const { currentPage, goToNextPage, goToPrevPage, hasPrev } = usePagination()

  const { projectName } = useParams()
  const { data: instances } = useApiQuery(
    'projectInstancesGet',
    { projectName, pageToken: currentPage, limit: PAGE_SIZE },
    { refetchInterval: 5000, keepPreviousData: true }
  )

  const columns = React.useMemo(() => COLUMNS, [])
  const data = React.useMemo(() => instances?.items || [], [instances?.items])
  const table = useTable({ columns, data }, useRowSelect, (hooks) => {
    hooks.visibleColumns.push((columns) => [selectCol, ...columns, menuCol])
  })

  if (!instances) return <div>loading</div>

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
