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
  getCompatiblePools,
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
    return getCompatiblePools(siloPools.items, undefined, 'unicast')
  }, [siloPools])

  // Determine compatible IP versions based on instance's primary network interface
  // External IPs route through the primary interface, so only its IP stack matters
  // https://github.com/oxidecomputer/omicron/blob/d52aad0/nexus/db-queries/src/db/datastore/external_ip.rs#L544-L661
  const compatibleVersions: IpVersion[] | undefined = useMemo(() => {
    // Before NICs load, return undefined (treat as "unknown" - allow all)
    if (!nics) return undefined

    const nicItems = nics.items
    const primaryNic = nicItems.find((nic) => nic.primary)

    // If no primary NIC found (defensive), return empty array
    if (!primaryNic) return []

    const versions: IpVersion[] = []
    if (primaryNic.ipStack.type === 'v4' || primaryNic.ipStack.type === 'dual_stack') {
      versions.push('v4')
    }
    if (primaryNic.ipStack.type === 'v6' || primaryNic.ipStack.type === 'dual_stack') {
      versions.push('v6')
    }
    return versions
  }, [nics])

  // Filter unicast pools by compatible IP versions
  const compatibleUnicastPools = useMemo(() => {
    return getCompatiblePools(unicastPools, compatibleVersions)
  }, [unicastPools, compatibleVersions])

  const hasDefaultCompatiblePool = useMemo(() => {
    return compatibleUnicastPools.some((p) => p.isDefault)
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

  const form = useForm<{ pool: string; ipVersion: IpVersion }>({
    defaultValues: {
      pool: '',
      ipVersion: 'v4',
    },
  })

  // Update ipVersion if only one version is compatible
  useEffect(() => {
    if (compatibleVersions && compatibleVersions.length === 1) {
      form.setValue('ipVersion', compatibleVersions[0])
    }
  }, [compatibleVersions, form])
  const pool = form.watch('pool')
  const ipVersion = form.watch('ipVersion')

  const getDisabledReason = () => {
    if (!siloPools) return 'Loading pools...'
    if (!nics) return 'Loading network interfaces...'
    if (compatibleVersions && compatibleVersions.length === 0) {
      return 'Instance has no network interfaces with compatible IP stacks'
    }
    if (compatibleUnicastPools.length === 0) {
      return 'No compatible unicast pools available for this instance'
    }
    if (!pool && !hasDefaultCompatiblePool) {
      return 'No default compatible pool available; select a pool to continue'
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
              pools={compatibleUnicastPools}
              currentPool={pool}
              setValue={form.setValue}
              disabled={compatibleUnicastPools.length === 0}
              compatibleVersions={compatibleVersions}
            />
          </form>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        actionText="Attach"
        disabled={
          !siloPools ||
          !nics ||
          (compatibleVersions && compatibleVersions.length === 0) ||
          compatibleUnicastPools.length === 0 ||
          (!pool && !hasDefaultCompatiblePool)
        }
        disabledReason={getDisabledReason()}
        onAction={() => {
          // When using default pool, derive ipVersion from available compatible defaults
          let effectiveIpVersion = ipVersion
          if (!pool) {
            const v4Default = compatibleUnicastPools.find(
              (p) => p.isDefault && p.ipVersion === 'v4'
            )
            const v6Default = compatibleUnicastPools.find(
              (p) => p.isDefault && p.ipVersion === 'v6'
            )

            // If only one default exists, use that version
            if (v4Default && !v6Default) {
              effectiveIpVersion = 'v4'
            } else if (v6Default && !v4Default) {
              effectiveIpVersion = 'v6'
            }
            // If both exist, use form's ipVersion (user's choice)
          }

          instanceEphemeralIpAttach.mutate({
            path: { instance },
            query: { project },
            body: pool
              ? { poolSelector: { type: 'explicit', pool } }
              : { poolSelector: { type: 'auto', ipVersion: effectiveIpVersion } },
          })
        }}
        onDismiss={onDismiss}
      ></Modal.Footer>
    </Modal>
  )
}
