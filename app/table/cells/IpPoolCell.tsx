import { useQuery } from '@tanstack/react-query'
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'

import { api, qErrorsAllowed } from '~/api'
import { IpPoolDetailSideModal } from '~/components/IpPoolDetailSideModal'

import { EmptyCell, SkeletonCell } from './EmptyCell'
import { ButtonCell } from './LinkCell'

const ipPoolQuery = (ipPoolId: string) =>
  qErrorsAllowed(
    api.ipPoolView,
    { path: { pool: ipPoolId } },
    {
      errorsExpected: {
        explanation: 'the referenced IP pool may have been deleted.',
        statusCode: 404,
      },
    }
  )

type IpPoolCellProps = {
  ipPoolId: string
  /** Show the IP pool detail sidebar on click. Defaults to true. Pass false to render as plain text. */
  showPoolInfo?: boolean
}

export const IpPoolCell = ({ ipPoolId, showPoolInfo = true }: IpPoolCellProps) => {
  const [showDetail, setShowDetail] = useState(false)
  const { data: result } = useQuery(ipPoolQuery(ipPoolId))
  if (!result) return <SkeletonCell />
  // Defensive: the error case should never happen in practice. It should not be
  // possible for a resource to reference a pool without that pool existing.
  if (result.type === 'error') return <EmptyCell />
  const pool = result.data
  if (!showPoolInfo) return <>{pool.name}</>
  return (
    <>
      <ButtonCell onClick={() => setShowDetail(true)}>{pool.name}</ButtonCell>
      {showDetail && (
        <IpPoolDetailSideModal pool={pool} onDismiss={() => setShowDetail(false)} />
      )}
    </>
  )
}
