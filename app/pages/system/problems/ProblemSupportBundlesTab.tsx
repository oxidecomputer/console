/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'

import { api, getListQFn, queryClient, type SupportBundleInfo } from '@oxide/api'
import { Archive24Icon } from '@oxide/design-system/icons/react'

import { SupportBundleStateBadge } from '~/components/StateBadge'
import { makeCrumb } from '~/hooks/use-crumbs'
import { useProblemSelector } from '~/hooks/use-params'
import { DescriptionCell } from '~/table/cells/DescriptionCell'
import { LinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { truncate } from '~/ui/lib/Truncate'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import type { Route } from './+types/ProblemSupportBundlesTab'

const bundleList = ({ problemId }: PP.Problem) =>
  getListQFn(api.problemSupportBundlesList, {
    path: { problemId },
    query: { sortBy: 'time_and_id_descending' },
  })

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { problemId } = params
  await queryClient.prefetchQuery(bundleList({ problemId }).optionsFn())
  return null
}

export const handle = makeCrumb('Support bundles')

const colHelper = createColumnHelper<SupportBundleInfo>()
const columns = [
  colHelper.accessor('id', {
    header: 'ID',
    cell: (info) => (
      <LinkCell to={pb.supportBundle({ bundleId: info.getValue() })}>
        {truncate(info.getValue(), 14, 'middle')}
      </LinkCell>
    ),
  }),
  colHelper.accessor('state', {
    cell: (info) => <SupportBundleStateBadge state={info.getValue()} />,
  }),
  colHelper.accessor('reasonForCreation', {
    header: 'Creation reason',
    cell: (info) => <DescriptionCell text={info.getValue()} />,
  }),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

export default function ProblemSupportBundlesTab() {
  const selector = useProblemSelector()
  const { table } = useQueryTable({
    query: bundleList(selector),
    columns,
    emptyState: (
      <EmptyMessage
        icon={<Archive24Icon />}
        title="No support bundles"
        body="Support bundles attached to this problem will appear here"
      />
    ),
  })
  return table
}
