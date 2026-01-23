/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import {
  api,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type IpVersion,
} from '~/api'
import { IpPoolSelector } from '~/components/form/fields/IpPoolSelector'
import { HL } from '~/components/HL'
import { useInstanceSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Modal } from '~/ui/lib/Modal'
import { ALL_ISH } from '~/util/consts'

export const AttachEphemeralIpModal = ({ onDismiss }: { onDismiss: () => void }) => {
  const { project, instance } = useInstanceSelector()
  const { data: siloPools } = usePrefetchedQuery(
    q(api.projectIpPoolList, { query: { limit: ALL_ISH } })
  )
  const { data: nics } = usePrefetchedQuery(
    q(api.instanceNetworkInterfaceList, { query: { project, instance } })
  )

  // Only unicast pools can be used for ephemeral IPs
  const unicastPools = useMemo(() => {
    if (!siloPools) return []
    return siloPools.items.filter((p) => p.poolType === 'unicast')
  }, [siloPools])

  const hasDefaultUnicastPool = useMemo(() => {
    return unicastPools.some((p) => p.isDefault)
  }, [unicastPools])

  // Determine compatible IP versions based on instance's network interfaces
  // External IP version must match the NIC's private IP stack
  const compatibleVersions: IpVersion[] = useMemo(() => {
    if (!nics) return []

    const nicItems = nics.items
    const hasV4Nic = nicItems.some(
      (nic) => nic.ipStack.type === 'v4' || nic.ipStack.type === 'dual_stack'
    )
    const hasV6Nic = nicItems.some(
      (nic) => nic.ipStack.type === 'v6' || nic.ipStack.type === 'dual_stack'
    )

    const versions: IpVersion[] = []
    if (hasV4Nic) versions.push('v4')
    if (hasV6Nic) versions.push('v6')
    return versions
  }, [nics])

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

  const form = useForm<{ pool: string; ipVersion: IpVersion }>({
    defaultValues: {
      pool: '',
      ipVersion: 'v4',
    },
  })

  // Update ipVersion if only one version is compatible
  useEffect(() => {
    if (compatibleVersions.length === 1) {
      form.setValue('ipVersion', compatibleVersions[0])
    }
  }, [compatibleVersions, form])
  const pool = form.watch('pool')
  const ipVersion = form.watch('ipVersion')

  const getDisabledReason = () => {
    if (!siloPools) return 'Loading pools...'
    if (unicastPools.length === 0) return 'No unicast pools available'
    if (!pool && !hasDefaultUnicastPool) {
      return 'No default pool available; select a pool to continue'
    }
    return undefined
  }

  return (
    <Modal isOpen title="Attach ephemeral IP" onDismiss={onDismiss}>
      <Modal.Body>
        <Modal.Section>
          <form>
            <IpPoolSelector
              control={form.control}
              poolFieldName="pool"
              ipVersionFieldName="ipVersion"
              pools={unicastPools}
              currentPool={pool}
              currentIpVersion={ipVersion}
              setValue={form.setValue}
              disabled={unicastPools.length === 0}
              compatibleVersions={compatibleVersions}
            />
          </form>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        actionText="Attach"
        disabled={
          !siloPools || unicastPools.length === 0 || (!pool && !hasDefaultUnicastPool)
        }
        disabledReason={getDisabledReason()}
        onAction={() => {
          instanceEphemeralIpAttach.mutate({
            path: { instance },
            query: { project },
            body: pool
              ? { poolSelector: { type: 'explicit', pool } }
              : { poolSelector: { type: 'auto', ipVersion } },
          })
        }}
        onDismiss={onDismiss}
      ></Modal.Footer>
    </Modal>
  )
}
