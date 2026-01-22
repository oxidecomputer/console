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

  return (
    <Modal isOpen title="Attach ephemeral IP" onDismiss={onDismiss}>
      <Modal.Body>
        <Modal.Section>
          <form className="space-y-4">
            <ListboxField
              control={form.control}
              name="pool"
              label="IP pool"
              placeholder="Default pool"
              items={(siloPools?.items ?? []).map(toIpPoolItem)}
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
        disabled={!siloPools}
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
