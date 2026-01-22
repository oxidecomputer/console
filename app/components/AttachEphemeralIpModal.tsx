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
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type IpVersion,
} from '~/api'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { HL } from '~/components/HL'
import { useInstanceSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Modal } from '~/ui/lib/Modal'
import { ALL_ISH } from '~/util/consts'

import { toIpPoolItem } from './form/fields/ip-pool-item'

export const AttachEphemeralIpModal = ({ onDismiss }: { onDismiss: () => void }) => {
  const { project, instance } = useInstanceSelector()
  const { data: siloPools } = usePrefetchedQuery(
    q(api.projectIpPoolList, { query: { limit: ALL_ISH } })
  )

  // Only unicast pools can be used for ephemeral IPs
  const unicastPools = useMemo(() => {
    if (!siloPools) return []
    return siloPools.items.filter((p) => p.poolType === 'unicast')
  }, [siloPools])

  const hasDefaultUnicastPool = useMemo(() => {
    return unicastPools.some((p) => p.isDefault)
  }, [unicastPools])

  // Detect if both IPv4 and IPv6 default unicast pools exist
  const hasDualDefaults = useMemo(() => {
    if (!siloPools) return false
    const defaultUnicastPools = siloPools.items.filter(
      (pool) => pool.isDefault && pool.poolType === 'unicast'
    )
    const hasV4Default = defaultUnicastPools.some((p) => p.ipVersion === 'v4')
    const hasV6Default = defaultUnicastPools.some((p) => p.ipVersion === 'v6')
    return hasV4Default && hasV6Default
  }, [siloPools])

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
    defaultValues: { pool: '', ipVersion: 'v4' },
  })
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
          <form className="space-y-4">
            <ListboxField
              control={form.control}
              name="pool"
              label="IP pool"
              placeholder={
                unicastPools.length === 0
                  ? 'No unicast pools available'
                  : hasDefaultUnicastPool
                    ? 'Default pool'
                    : 'Select a pool (no default available)'
              }
              description={
                unicastPools.length === 0
                  ? 'Contact your administrator to create a unicast IP pool'
                  : undefined
              }
              items={unicastPools.map(toIpPoolItem)}
            />
            {!pool && hasDualDefaults && (
              <ListboxField
                control={form.control}
                name="ipVersion"
                label="IP version"
                description="Both IPv4 and IPv6 default pools exist; select a version"
                items={[
                  { label: 'IPv4', value: 'v4' },
                  { label: 'IPv6', value: 'v6' },
                ]}
                required
              />
            )}
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
              : hasDualDefaults
                ? { poolSelector: { type: 'auto', ipVersion } }
                : { poolSelector: { type: 'auto' } },
          })
        }}
        onDismiss={onDismiss}
      ></Modal.Footer>
    </Modal>
  )
}
