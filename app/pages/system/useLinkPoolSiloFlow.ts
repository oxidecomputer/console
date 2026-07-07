/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import {
  api,
  queryClient,
  useApiMutation,
  type IpPoolLinkSilo,
  type SubnetPoolLinkSilo,
  type SystemIpPoolSiloUpdatePathParams,
  type SystemSubnetPoolSiloUpdatePathParams,
} from '@oxide/api'

import { addToast } from '~/stores/toast'
import { classed } from '~/util/classed'

/**
 * "Replaces …" note shown under the make-default checkbox in the link modals.
 * The negative bottom margin lets it sit in the modal's existing bottom padding
 * instead of growing the modal: its line box is mt-1 (4px) + one line of
 * text-sans-sm (line-height 1rem = 16px) = 20px, and -mb-4 (16px) pulls the
 * footer back up so it shifts by only ~4px when the note appears.
 */
export const ReplacedDefaultNote = classed.span`mt-1 -mb-4 block text-sans-sm text-tertiary`

type ToastOptions = {
  linkErrorTitle: string
  promoteErrorTitle: string
}

type LinkIpPoolSiloOptions = ToastOptions

type LinkIpPoolSiloValues = SystemIpPoolSiloUpdatePathParams & {
  isDefault: IpPoolLinkSilo['isDefault']
}

export function useLinkIpPoolSiloFlow({
  linkErrorTitle,
  promoteErrorTitle,
}: LinkIpPoolSiloOptions) {
  function invalidate() {
    queryClient.invalidateEndpoint('siloIpPoolList')
    queryClient.invalidateEndpoint('systemIpPoolSiloList')
  }

  const link = useApiMutation(api.systemIpPoolSiloLink, {
    onSuccess: invalidate,
    onError(err) {
      addToast({ title: linkErrorTitle, content: err.message, variant: 'error' })
    },
  })
  const promote = useApiMutation(api.systemIpPoolSiloUpdate, { onSuccess: invalidate })

  async function linkAndMaybePromote({ pool, silo, isDefault }: LinkIpPoolSiloValues) {
    try {
      // Link non-default first so callers can replace an existing default through
      // the update endpoint, which demotes the previous default automatically.
      await link.mutateAsync({ path: { pool }, body: { silo, isDefault: false } })
    } catch {
      return false // onError already toasted; leave the modal open to retry
    }
    if (isDefault) {
      try {
        await promote.mutateAsync({ path: { pool, silo }, body: { isDefault: true } })
      } catch {
        addToast({
          title: promoteErrorTitle,
          content: 'Use the row menu to make it the default.',
          variant: 'error',
        })
      }
    }
    return true
  }

  return {
    isPending: link.isPending || promote.isPending,
    linkAndMaybePromote,
  }
}

type LinkSubnetPoolSiloOptions = ToastOptions

type LinkSubnetPoolSiloValues = SystemSubnetPoolSiloUpdatePathParams & {
  isDefault: SubnetPoolLinkSilo['isDefault']
}

export function useLinkSubnetPoolSiloFlow({
  linkErrorTitle,
  promoteErrorTitle,
}: LinkSubnetPoolSiloOptions) {
  function invalidate() {
    queryClient.invalidateEndpoint('siloSubnetPoolList')
    queryClient.invalidateEndpoint('systemSubnetPoolSiloList')
  }

  const link = useApiMutation(api.systemSubnetPoolSiloLink, {
    onSuccess: invalidate,
    onError(err) {
      addToast({ title: linkErrorTitle, content: err.message, variant: 'error' })
    },
  })
  const promote = useApiMutation(api.systemSubnetPoolSiloUpdate, {
    onSuccess: invalidate,
  })

  async function linkAndMaybePromote({ pool, silo, isDefault }: LinkSubnetPoolSiloValues) {
    try {
      // Link non-default first so callers can replace an existing default through
      // the update endpoint, which demotes the previous default automatically.
      await link.mutateAsync({ path: { pool }, body: { silo, isDefault: false } })
    } catch {
      return false // onError already toasted; leave the modal open to retry
    }
    if (isDefault) {
      try {
        await promote.mutateAsync({ path: { pool, silo }, body: { isDefault: true } })
      } catch {
        addToast({
          title: promoteErrorTitle,
          content: 'Use the row menu to make it the default.',
          variant: 'error',
        })
      }
    }
    return true
  }

  return {
    isPending: link.isPending || promote.isPending,
    linkAndMaybePromote,
  }
}
