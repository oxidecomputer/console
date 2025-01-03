/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { useApiMutation, useApiQueryClient, usePrefetchedApiQuery } from '~/api'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { HL } from '~/components/HL'
import { useInstanceSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Modal } from '~/ui/lib/Modal'
import { ALL_ISH } from '~/util/consts'

import { toIpPoolItem } from './form/fields/ip-pool-item'

export const AttachEphemeralIpModal = ({ onDismiss }: { onDismiss: () => void }) => {
  const queryClient = useApiQueryClient()
  const { project, instance } = useInstanceSelector()
  const { data: siloPools } = usePrefetchedApiQuery('projectIpPoolList', {
    query: { limit: ALL_ISH },
  })
  const defaultPool = useMemo(
    () => siloPools?.items.find((pool) => pool.isDefault),
    [siloPools]
  )
  const instanceEphemeralIpAttach = useApiMutation('instanceEphemeralIpAttach', {
    onSuccess(ephemeralIp) {
      queryClient.invalidateQueries('instanceExternalIpList')
      addToast(<>IP <HL>{ephemeralIp.ip}</HL> attached</>) // prettier-ignore
      onDismiss()
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
  })
  const form = useForm({ defaultValues: { pool: defaultPool?.name } })
  const pool = form.watch('pool')

  return (
    <Modal isOpen title="Attach ephemeral IP" onDismiss={onDismiss}>
      <Modal.Body>
        <Modal.Section>
          <form>
            <ListboxField
              control={form.control}
              name="pool"
              label="IP pool"
              placeholder={
                siloPools?.items && siloPools.items.length > 0
                  ? 'Select a pool'
                  : 'No pools available'
              }
              items={siloPools.items.map(toIpPoolItem)}
              required
            />
          </form>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        actionText="Attach"
        disabled={!pool}
        onAction={() =>
          instanceEphemeralIpAttach.mutate({
            path: { instance },
            query: { project },
            body: { pool },
          })
        }
        onDismiss={onDismiss}
      ></Modal.Footer>
    </Modal>
  )
}
