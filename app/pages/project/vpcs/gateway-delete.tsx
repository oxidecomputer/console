/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useId, useState } from 'react'

import {
  queryClient,
  type api,
  type InternetGatewayIpAddressResultsPage,
  type InternetGatewayIpPoolResultsPage,
} from '~/api'
import { RadioCard } from '~/components/RadioCard'
import { confirmDelete } from '~/stores/confirm-delete'
import type * as PP from '~/util/path-params'

import { gatewayIpAddressList, gatewayIpPoolList } from './gateway-data'

function attachmentsNotice(numPools: number, numAddresses: number) {
  const parts = []
  if (numPools > 0) parts.push(`${numPools} IP ${numPools === 1 ? 'pool' : 'pools'}`)
  if (numAddresses > 0) {
    parts.push(`${numAddresses} IP ${numAddresses === 1 ? 'address' : 'addresses'}`)
  }
  if (parts.length === 0) return undefined
  return `${parts.join(' and ')} must be detached first`
}

function GatewayCascadeChoice({
  numPools,
  numAddresses,
  onChange,
}: {
  numPools: number
  numAddresses: number
  onChange: (cascade: boolean) => void
}) {
  const hasAttachments = numPools > 0 || numAddresses > 0
  const [cascade, setCascade] = useState(hasAttachments)
  const name = useId()

  function select(value: boolean) {
    setCascade(value)
    onChange(value)
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      <RadioCard
        name={name}
        checked={!cascade}
        onChange={() => select(false)}
        disabled={hasAttachments}
        label="Delete gateway only"
        description="The gateway is deleted, attached resources and routes are untouched"
        notice={attachmentsNotice(numPools, numAddresses)}
      />
      <RadioCard
        name={name}
        checked={cascade}
        onChange={() => select(true)}
        label="Delete gateway and detach resources"
        description="IP pools and IP addresses are detached and routes targeting this gateway are deleted"
      />
    </div>
  )
}

/**
 * Shared "delete internet gateway" confirmation, used by both the gateways
 * table and the gateway detail page. Returns a callback suitable for
 * `onActivate`/`onSelect`.
 */
export function confirmDeleteGateway({
  project,
  vpc,
  gateway,
  deleteGateway,
}: PP.VpcInternetGateway & {
  deleteGateway: (
    params: Parameters<typeof api.internetGatewayDelete>[0]
  ) => Promise<unknown>
}) {
  return () => {
    // already fetched by the pages that list a gateway's pools/addresses, so
    // this reads from cache rather than triggering a new request
    const pools = queryClient.getQueryData<InternetGatewayIpPoolResultsPage>(
      gatewayIpPoolList({ project, vpc, gateway }).optionsFn().queryKey
    )
    const addresses = queryClient.getQueryData<InternetGatewayIpAddressResultsPage>(
      gatewayIpAddressList({ project, vpc, gateway }).optionsFn().queryKey
    )
    const numPools = pools?.items.length ?? 0
    const numAddresses = addresses?.items.length ?? 0

    // when there are attachments, the non-cascading option is disabled, so
    // cascade starts out selected
    let cascade = numPools > 0 || numAddresses > 0
    confirmDelete({
      doDelete: () =>
        deleteGateway({ path: { gateway }, query: { project, vpc, cascade } }),
      label: gateway,
      resourceKind: 'internet gateway',
      extraContent: (
        <GatewayCascadeChoice
          numPools={numPools}
          numAddresses={numAddresses}
          onChange={(value) => {
            cascade = value
          }}
        />
      ),
    })()
  }
}
