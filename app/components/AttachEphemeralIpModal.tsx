/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useCallback, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import {
  api,
  isUnicastPool,
  poolHasIpVersion,
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
import { getCompatibleVersionsFromNics, getDefaultIps } from '~/util/ip'

export const AttachEphemeralIpModal = ({ onDismiss }: { onDismiss: () => void }) => {
  const { project, instance } = useInstanceSelector()
  const { data: siloPools } = usePrefetchedQuery(
    q(api.projectIpPoolList, { query: { limit: ALL_ISH } })
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
    if (compatibleVersions.length === 1) {
      form.setValue('ipVersion', compatibleVersions[0])
    }
  }, [compatibleVersions, form])
  const pool = form.watch('pool')
  const ipVersion = form.watch('ipVersion')

  const disabledState = useMemo(() => {
    if (compatibleVersions.length === 0) {
      return {
        disabled: true,
        reason: 'Instance has no network interfaces with compatible IP stacks',
      }
    }
    if (compatibleUnicastPools.length === 0) {
      return {
        disabled: true,
        reason: 'No compatible unicast pools available for this instance',
      }
    }
    if (!pool && !hasDefaultCompatiblePool) {
      return {
        disabled: true,
        reason: 'No default compatible pool available; select a pool to continue',
      }
    }
    return { disabled: false, reason: undefined }
  }, [compatibleVersions, compatibleUnicastPools, pool, hasDefaultCompatiblePool])

  const getEffectiveIpVersion = useCallback(() => {
    if (pool) return ipVersion

    const { hasV4Default, hasV6Default } = getDefaultIps(compatibleUnicastPools)

    if (hasV4Default && !hasV6Default) return 'v4'
    if (hasV6Default && !hasV4Default) return 'v6'

    return ipVersion
  }, [pool, ipVersion, compatibleUnicastPools])

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
        disabled={disabledState.disabled}
        disabledReason={disabledState.reason}
        onAction={() => {
          const effectiveIpVersion = getEffectiveIpVersion()

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
