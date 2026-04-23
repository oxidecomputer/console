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
  sortPools,
  useApiMutation,
  usePrefetchedQuery,
  type IpVersion,
} from '~/api'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { ModalForm } from '~/components/form/ModalForm'
import { HL } from '~/components/HL'
import { toPoolItem } from '~/components/PoolListboxItem'
import { useInstanceSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
import { ALL_ISH } from '~/util/consts'

type AttachEphemeralIpModalProps = {
  availableVersions: IpVersion[]
  infoMessage: string | null
  onDismiss: () => void
}

export const AttachEphemeralIpModal = ({
  availableVersions,
  infoMessage,
  onDismiss,
}: AttachEphemeralIpModalProps) => {
  const { project, instance } = useInstanceSelector()
  const { data: siloPools } = usePrefetchedQuery(
    q(api.ipPoolList, { query: { limit: ALL_ISH } })
  )

  // Only show unicast pools for the IP versions that still have open slots
  const compatibleUnicastPools = useMemo(
    () => siloPools.items.filter(isUnicastPool).filter(poolHasIpVersion(availableVersions)),
    [siloPools, availableVersions]
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
  })

  const form = useForm({ defaultValues: { pool: defaultPool } })
  const pool = form.watch('pool')

  return (
    <ModalForm
      form={form}
      title="Attach ephemeral IP"
      onDismiss={onDismiss}
      submitLabel="Attach"
      submitDisabled={!pool}
      submitError={instanceEphemeralIpAttach.error}
      loading={instanceEphemeralIpAttach.isPending}
      onSubmit={({ pool }) => {
        instanceEphemeralIpAttach.mutate({
          path: { instance },
          query: { project },
          body: { poolSelector: { type: 'explicit', pool } },
        })
      }}
    >
      {infoMessage && <Message variant="info" content={infoMessage} />}
      <ListboxField
        name="pool"
        label="Pool"
        control={form.control}
        items={sortPools(compatibleUnicastPools).map(toPoolItem)}
        disabled={compatibleUnicastPools.length === 0}
        placeholder="Select a pool"
        noItemsPlaceholder="No pools available"
      />
    </ModalForm>
  )
}
