import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTable, useRowSelect } from 'react-table'
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'
import filesize from 'filesize'

import type { ApiInstanceView } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Button, Icon, selectCol, Table2 } from '@oxide/ui'
import { StatusBadge } from '../../components/StatusBadge'
import { timeAgoAbbr } from '../../util/date'
import { usePagination } from '../../hooks'

const COLUMNS = [
  {
    accessor: 'name' as const,
    Header: () => <div className="text-left">Name</div>,
    Cell: ({ value }: { value: string }) => (
      <Link
        className="text-green-500"
        // TODO: template in projectName
        to={`/projects/prod-online/instances/${value}`}
      >
        {value}
      </Link>
    ),
  },
  {
    accessor: (i: ApiInstanceView) => ({ ncpus: i.ncpus, memory: i.memory }),
    id: 'resources',
    Header: () => <div className="text-left">CPU / RAM</div>,
    Cell: ({ value }: { value: Pick<ApiInstanceView, 'ncpus' | 'memory'> }) =>
      `${value.ncpus} vCPU, ${filesize(value.memory)}`,
  },
  {
    accessor: (i: ApiInstanceView) => ({
      runState: i.runState,
      timeRunStateUpdated: i.timeRunStateUpdated,
    }),
    id: 'status',
    Header: () => <div className="text-left">Status</div>,
    Cell: ({
      value,
    }: {
      value: Pick<ApiInstanceView, 'runState' | 'timeRunStateUpdated'>
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
  Cell: () => (
    <Menu>
      <MenuButton>
        <Icon name="more" className="text-base text-gray-200 mr-4" />
      </MenuButton>
      <MenuList className="TableControls">
        <MenuItem onSelect={() => {}}>Delete</MenuItem>
        <MenuItem onSelect={() => {}}>Interpret</MenuItem>
        <MenuItem onSelect={() => {}}>Astonish</MenuItem>
      </MenuList>
    </Menu>
  ),
}

export const InstancesTable = () => {
  const { currentPage, goToNextPage, goToPrevPage, hasPrev } = usePagination()

  const { projectName } = useParams<{ projectName: string }>()
  const { data: instances } = useApiQuery(
    'apiProjectInstancesGet',
    { projectName, pageToken: currentPage, limit: 2 },
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
    return <div className="mt-4">No instances yet</div>
  }

  return (
    <>
      <Table2 className="mt-4" table={table} />
      <div className="mt-4 space-x-4">
        <Button onClick={goToPrevPage} disabled={!hasPrev}>
          <Icon name="arrow" className="transform rotate-180" />
        </Button>
        <Button
          onClick={() => instances.nextPage && goToNextPage(instances.nextPage)}
          disabled={!instances.nextPage}
        >
          <Icon name="arrow" />
        </Button>
      </div>
    </>
  )
}
