/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import {
  api,
  isUnicastPool,
  poolHasIpVersion,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
} from '~/api'
import { IpPoolSelector } from '~/components/form/fields/IpPoolSelector'
import { HL } from '~/components/HL'
import { useInstanceSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Modal } from '~/ui/lib/Modal'
import { ALL_ISH } from '~/util/consts'
import { getCompatibleVersionsFromNics } from '~/util/ip'

export const AttachEphemeralIpModal = ({ onDismiss }: { onDismiss: () => void }) => {
  const { project, instance } = useInstanceSelector()
  const { data: siloPools } = usePrefetchedQuery(
    q(api.ipPoolList, { query: { limit: ALL_ISH } })
  )
  const { data: nics } = usePrefetchedQuery(
    q(api.instanceNetworkInterfaceList, { query: { limit: ALL_ISH, project, instance } })
  )

  // Determine compatible IP versions based on instance's primary network interface
  // External IPs route through the primary interface, so only its IP stack matters
  // https://github.com/oxidecomputer/omicron/blob/d52aad0/nexus/db-queries/src/db/datastore/external_ip.rs#L544-L661
  const compatibleVersions = useMemo(
    () => getCompatibleVersionsFromNics(nics.items),
    [nics]
  )

  // Only unicast pools can be used for ephemeral IPs
  const compatibleUnicastPools = useMemo(
    () =>
      siloPools.items.filter(isUnicastPool).filter(poolHasIpVersion(compatibleVersions)),
    [siloPools, compatibleVersions]
  )

  const defaultPool = useMemo(() => {
    const defaults = compatibleUnicastPools.filter((p) => p.isDefault)
    // Only preselect if there's exactly one compatible default; if both v4 and
    // v6 defaults exist, let the user choose
    return defaults.length === 1 ? defaults[0].name : ''
  }, [compatibleUnicastPools])

  const instanceEphemeralIpAttach = useApiMutation(api.instanceEphemeralIpAttach, {
    onSuccess(ephemeralIp) {
      queryClient.invalidateEndpoint('instanceExternalIpList')
      // prettier-ignore
      addToast(<>IP <HL>{ephemeralIp.ip}</HL> attached</>)
      onDismiss()
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
  })

  const form = useForm({ defaultValues: { pool: defaultPool } })
  const pool = form.watch('pool')

  const disabledReason =
    compatibleVersions.length === 0
      ? 'Instance has no network interfaces with compatible IP stacks'
      : compatibleUnicastPools.length === 0
        ? 'No compatible unicast pools available for this instance'
        : !pool
          ? 'Select a pool to continue'
          : undefined

  return (
    <Modal isOpen title="Attach ephemeral IP" onDismiss={onDismiss}>
      <Modal.Body>
        <Modal.Section>
          <form>
            <IpPoolSelector
              control={form.control}
              poolFieldName="pool"
              pools={compatibleUnicastPools}
              disabled={compatibleUnicastPools.length === 0}
              compatibleVersions={compatibleVersions}
            />
          </form>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        actionText="Attach"
        disabled={!!disabledReason}
        disabledReason={disabledReason}
        onAction={() => {
          instanceEphemeralIpAttach.mutate({
            path: { instance },
            query: { project },
            body: {
              poolSelector: { type: 'explicit', pool },
            },
          })
        }}
        onDismiss={onDismiss}
      ></Modal.Footer>
    </Modal>
  )
}
