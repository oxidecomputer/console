import React from 'react'
import cn from 'classnames'

import { Avatar } from '../avatar/Avatar'
import { Icon } from '../icon/Icon'
import { classed } from '../../util/classed'
import { users } from './fake-data'

const Row = classed.tr`border-b border-gray-400 last-of-type:border-none h-[60px]`
const Th = classed.th`font-light uppercase text-left`

const AccessIcon = ({ checked }: { checked: boolean }) =>
  checked ? (
    <Icon name="check" className="text-green-500 !w-6" />
  ) : (
    <Icon name="prohibited" className="text-red-500 !w-4" />
  )

type Props = { className?: string }

// TODO: turns out rounded corners on a table requires border-collapse separate,
// which requires further shenanigans to get the borders to behave

export const Table2 = ({ className }: Props) => {
  return (
    <table className={cn('w-full border border-gray-400 text-xs', className)}>
      <thead className="h-[40px] bg-gray-500 border-b border-gray-400">
        <tr>
          <Th></Th>
          <Th>Name</Th>
          <Th>Accessed</Th>
          <Th className="!text-center">Read</Th>
          <Th className="!text-center">Modify</Th>
          <Th className="!text-center">Create</Th>
          <Th className="!text-center">Admin</Th>
          <Th></Th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <Row key={user.name}>
            <td className="w-14 text-center">
              <input type="checkbox" className="mr-2" />
            </td>
            <td className="flex items-center h-[60px]">
              <Avatar
                round
                size="xs"
                name={user.name}
                className="inline-block"
              />
              <span className="ml-3 text-sm font-sans font-light">
                {user.name}
              </span>
            </td>
            <td className="uppercase text-gray-200 w-1/3">
              {user.lastAccessed}
            </td>
            <td className="text-center">
              <AccessIcon checked={user.access.read} />
            </td>
            <td className="text-center">
              <AccessIcon checked={user.access.modify} />
            </td>
            <td className="text-center">
              <AccessIcon checked={user.access.create} />
            </td>
            <td className="text-center">
              <AccessIcon checked={user.access.admin} />
            </td>
            <td className="min-w-[2rem] text-right">
              <button type="button">
                <Icon name="more" className="text-base text-gray-200 mr-4" />
              </button>
            </td>
          </Row>
        ))}
      </tbody>
    </table>
  )
}
