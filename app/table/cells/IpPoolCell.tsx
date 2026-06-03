/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { api, qErrorsAllowed } from '~/api'
import { IpPoolDetailSideModal } from '~/components/IpPoolDetailSideModal'
import { useIsInSideModal } from '~/ui/lib/modal-context'
import { Tooltip } from '~/ui/lib/Tooltip'

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

/**
 * Renders an IP pool name. In a table cell, clicking opens a side modal with
 * pool details. Inside a side modal (detected via context) it shows the
 * description in a tooltip.
 */
export const IpPoolCell = ({ ipPoolId }: { ipPoolId: string }) => {
  const inSideModal = useIsInSideModal()
  const [showDetail, setShowDetail] = useState(false)
  const { data: result } = useQuery(ipPoolQuery(ipPoolId))
  if (!result) return <SkeletonCell />
  // Defensive: the error case should never happen in practice. It should not be
  // possible for a resource to reference a pool without that pool existing.
  if (result.type === 'error') return <EmptyCell />
  const pool = result.data
  return inSideModal ? (
    <Tooltip content={pool.description} placement="right">
      <span>{pool.name}</span>
    </Tooltip>
  ) : (
    <>
      <ButtonCell onClick={() => setShowDetail(true)}>{pool.name}</ButtonCell>
      {showDetail && (
        <IpPoolDetailSideModal pool={pool} onDismiss={() => setShowDetail(false)} />
      )}
    </>
  )
}
