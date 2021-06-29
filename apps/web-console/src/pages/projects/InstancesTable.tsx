import React from 'react'
import 'twin.macro'
import { useParams, Link } from 'react-router-dom'
import { useTable, useRowSelect } from 'react-table'
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'
import filesize from 'filesize'

import type { ApiInstanceView } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Icon, selectCol, Table2 } from '@oxide/ui'
import { StatusBadge } from '../../components/StatusBadge'
import { timeAgoAbbr } from '../../util/date'

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
      <span tw="inline-flex">
        <StatusBadge tw="mr-2" size="sm" status={value.runState} />
        <abbr
          tw="text-xs no-underline!"
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
  const { projectName } = useParams<{ projectName: string }>()
  const { data: instances } = useApiQuery(
    'apiProjectInstancesGet',
    { projectName },
    { refetchInterval: 5000 }
  )

  const columns = React.useMemo(() => COLUMNS, [])
  const data = React.useMemo(() => instances?.items || [], [instances?.items])
  const table = useTable({ columns, data }, useRowSelect, (hooks) => {
    hooks.visibleColumns.push((columns) => [selectCol, ...columns, menuCol])
  })

  if (!instances) return <div>loading</div>

  return (
    <>
      {instances.items.length > 0 && <Table2 className="mt-4" table={table} />}
      {instances.items.length === 0 && <div tw="mt-4">No instances yet</div>}
    </>
  )
}
