/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useForm } from 'react-hook-form'

import { useApiMutation, useApiQueryClient, type FloatingIp, type Instance } from '~/api'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { Slash } from '~/ui/lib/Slash'

function FloatingIpLabel({ fip }: { fip: FloatingIp }) {
  return (
    <div className="text-tertiary selected:text-accent-secondary">
      <div>{fip.name}</div>
      <div className="flex gap-0.5">
        <div>{fip.ip}</div>
        {fip.description && (
          <>
            <Slash />
            <div className="grow overflow-hidden overflow-ellipsis whitespace-pre text-left">
              {fip.description}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export const AttachFloatingIpModal = ({
  floatingIps,
  instance,
  onDismiss,
}: {
  floatingIps: Array<FloatingIp>
  instance: Instance
  onDismiss: () => void
}) => {
  const queryClient = useApiQueryClient()
  const floatingIpAttach = useApiMutation('floatingIpAttach', {
    onSuccess(floatingIp) {
      queryClient.invalidateQueries('floatingIpList')
      queryClient.invalidateQueries('instanceExternalIpList')
      addToast({ content: `${floatingIp.name} attached` })
      onDismiss()
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
  })
  const form = useForm({ defaultValues: { floatingIp: '' } })
  const floatingIp = form.watch('floatingIp')

  return (
    <Modal isOpen title="Attach floating IP" onDismiss={onDismiss}>
      <Modal.Body>
        <Modal.Section>
          <Message
            variant="info"
            content={`Instance ‘${instance.name}’ will be reachable at the selected IP address`}
          />
          <form>
            <ListboxField
              control={form.control}
              name="floatingIp"
              label="Floating IP"
              placeholder="Select a floating IP"
              items={floatingIps.map((ip) => ({
                value: ip.id,
                label: <FloatingIpLabel fip={ip} />,
                selectedLabel: ip.name,
              }))}
              required
            />
          </form>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        actionText="Attach"
        disabled={!floatingIp}
        onAction={() =>
          floatingIpAttach.mutate({
            path: { floatingIp }, // note that this is an ID!
            body: { kind: 'instance', parent: instance.id },
          })
        }
        onDismiss={onDismiss}
      ></Modal.Footer>
    </Modal>
  )
}
