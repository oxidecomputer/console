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
import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { useInstanceSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Badge } from '~/ui/lib/Badge'
import { Modal } from '~/ui/lib/Modal'
import { ALL_ISH } from '~/util/consts'

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
    onSuccess() {
      queryClient.invalidateQueries('instanceExternalIpList')
      addToast({ content: 'Your ephemeral IP has been attached' })
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
            <ComboboxField
              control={form.control}
              name="pool"
              label="IP pool"
              placeholder={
                siloPools?.items && siloPools.items.length > 0
                  ? 'Select a pool'
                  : 'No pools available'
              }
              items={
                siloPools?.items.map((pool) => ({
                  label: (
                    <div className="flex flex-col gap-1">
                      <div>
                        {pool.name}
                        {pool.isDefault && (
                          <Badge className="ml-1" color="neutral">
                            default
                          </Badge>
                        )}
                      </div>
                      {pool.description.length && (
                        <div className="text-tertiary selected:text-accent-secondary">
                          {pool.description}
                        </div>
                      )}
                    </div>
                  ),
                  selectedLabel: pool.name,
                  value: pool.name,
                })) || []
              }
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
