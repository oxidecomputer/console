/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useForm } from 'react-hook-form'

import { useApiMutation, useApiQueryClient, type FloatingIp, type Instance } from '~/api'
import { addToast } from '~/stores/toast'
import { Listbox } from '~/ui/lib/Listbox'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'

export const AttachFloatingIpModal = ({
  floatingIps,
  instance,
  project,
  onDismiss,
}: {
  floatingIps: Array<FloatingIp>
  instance: Instance
  project: string
  onDismiss: () => void
}) => {
  const queryClient = useApiQueryClient()
  const floatingIpAttach = useApiMutation('floatingIpAttach', {
    onSuccess() {
      queryClient.invalidateQueries('floatingIpList')
      queryClient.invalidateQueries('instanceExternalIpList')
      addToast({ content: 'Your Floating IP has been attached' })
      onDismiss()
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
  })
  const form = useForm({ defaultValues: { floatingIp: '' } })

  return (
    <Modal isOpen title="Attach floating IP" onDismiss={onDismiss}>
      <Modal.Body>
        <Modal.Section>
          <Message
            variant="info"
            content={`Instance ‘${instance.name}’ will be reachable at the selected IP address`}
          />
          <form>
            <Listbox
              name="floatingIp"
              items={floatingIps.map((ip) => ({
                value: ip.id,
                label: (
                  <div className="text-tertiary selected:text-accent-secondary">
                    <div>{ip.name}</div>
                    <div className="flex gap-0.5">
                      <div>{ip.ip}</div>
                      <span className="mx-1 text-quinary selected:text-accent-disabled">
                        /
                      </span>
                      <div className="flex-grow overflow-hidden overflow-ellipsis whitespace-pre text-left">
                        {ip.description || '—'}
                      </div>
                    </div>
                  </div>
                ),
                labelString: ip.name,
              }))}
              label="Floating IP"
              onChange={(e) => {
                form.setValue('floatingIp', e)
              }}
              required
              placeholder="Select floating IP"
              selected={form.watch('floatingIp')}
            />
          </form>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        actionText="Attach"
        disabled={!form.getValues('floatingIp')}
        onAction={() =>
          floatingIpAttach.mutate({
            path: { floatingIp: form.getValues('floatingIp')! },
            query: { project },
            body: { kind: 'instance', parent: instance.id },
          })
        }
        onDismiss={onDismiss}
      ></Modal.Footer>
    </Modal>
  )
}
