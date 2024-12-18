/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import {
  getListQFn,
  queryClient,
  useApiQuery,
  type SledProvisionPolicy,
  type SledState,
} from '@oxide/api'

import { Badge, type BadgeColor } from '~/ui/lib/Badge'
import { Table } from '~/ui/lib/Table'
import { truncate } from '~/ui/lib/Truncate'

const PROV_POLICY_DISP: Record<SledProvisionPolicy, [string, BadgeColor]> = {
  provisionable: ['Provisionable', 'default'],
  non_provisionable: ['Not provisionable', 'neutral'],
}

const STATE_BADGE_COLORS: Record<SledState, BadgeColor> = {
  active: 'default',
  decommissioned: 'neutral',
}

const sledList = getListQFn('sledList', {})

export async function loader() {
  await queryClient.prefetchQuery(sledList.optionsFn())
  return null
}

// THIS ISNT REAL ITS FOR DESIGN EXPERIMENTATION
Component.displayName = 'SledsTab'
export function Component() {
  // const sledList = getListQFn('sledList', {})

  // const emptyState = <EmptyMessage icon={<Servers24Icon />} title="No sleds found" />
  // const {
  //   query: { data: sleds },
  // } = useQueryTable({ query: sledList, emptyState: <EmptyState /> })
  // console.log(sleds)

  const { data: sleds } = useApiQuery('sledList', {})

  return (
    <Table>
      <Table.Header>
        <Table.HeaderRow>
          <Table.HeadCell>ID</Table.HeadCell>
          <Table.HeadCell colSpan={3}>Baseboard</Table.HeadCell>
          <Table.HeadCell colSpan={2}>Policy</Table.HeadCell>
          <Table.HeadCell>State</Table.HeadCell>
        </Table.HeaderRow>
        <Table.HeaderRow>
          <Table.HeadCell data-test-ignore></Table.HeadCell>
          <Table.HeadCell>Part No.</Table.HeadCell>
          <Table.HeadCell>Serial No.</Table.HeadCell>
          <Table.HeadCell>Rev</Table.HeadCell>
          <Table.HeadCell>Kind</Table.HeadCell>
          <Table.HeadCell>Provisionable</Table.HeadCell>
          <Table.HeadCell data-test-ignore></Table.HeadCell>
        </Table.HeaderRow>
      </Table.Header>

      <Table.Body>
        {sleds?.items.map((sled) => (
          <Table.Row key={sled.id}>
            <Table.Cell>{truncate(sled.id, 20, 'middle')}</Table.Cell>
            <Table.Cell>{sled.baseboard.part}</Table.Cell>
            <Table.Cell>{sled.baseboard.serial}</Table.Cell>
            <Table.Cell>{sled.baseboard.revision}</Table.Cell>
            <Table.Cell>
              <Badge color={sled.policy.kind === 'expunged' ? 'neutral' : 'default'}>
                {sled.policy.kind}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              {sled.policy.kind !== 'expunged' ? (
                <Badge
                  variant="default"
                  color={PROV_POLICY_DISP[sled.policy.provisionPolicy][1]}
                >
                  {PROV_POLICY_DISP[sled.policy.provisionPolicy][0] === 'Provisionable'
                    ? 'True'
                    : 'False'}
                </Badge>
              ) : (
                <span className="text-quaternary">-</span>
              )}
            </Table.Cell>
            <Table.Cell>
              <Badge color={STATE_BADGE_COLORS[sled.state]}>{sled.state}</Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
