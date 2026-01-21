/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useForm } from 'react-hook-form'

import { api, q, queryClient, useApiMutation, usePrefetchedQuery } from '~/api'
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
  const form = useForm({ defaultValues: { pool: '' } })
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
              placeholder="Default pool"
              items={siloPools.items.map(toIpPoolItem)}
            />
          </form>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        actionText="Attach"
        onAction={() => {
          instanceEphemeralIpAttach.mutate({
            path: { instance },
            query: { project },
            body: pool
              ? { poolSelector: { type: 'explicit', pool } }
              : { poolSelector: { type: 'auto' } },
          })
        }}
        onDismiss={onDismiss}
      ></Modal.Footer>
    </Modal>
  )
}
