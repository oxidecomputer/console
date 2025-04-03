/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useForm } from 'react-hook-form'

import { queryClient, useApiMutation, type Instance } from '~/api'
import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { HL } from '~/components/HL'
import { useAntiAffinityGroupSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { toComboboxItems } from '~/ui/lib/Combobox'
import { Modal } from '~/ui/lib/Modal'

export function AddAntiAffinityGroupMemberForm({
  availableInstances,
  isModalOpen,
  setIsModalOpen,
}: {
  availableInstances: Instance[]
  isModalOpen: boolean
  setIsModalOpen: (open: boolean) => void
}) {
  const { project, antiAffinityGroup } = useAntiAffinityGroupSelector()

  const form = useForm({
    defaultValues: {
      antiAffinityGroupMember: '',
    },
  })

  const onDismiss = () => {
    setIsModalOpen(false)
    form.reset()
  }

  const { mutateAsync: addMember } = useApiMutation('antiAffinityGroupMemberInstanceAdd', {
    onSuccess(_data, variables) {
      onDismiss()
      queryClient.invalidateEndpoint('antiAffinityGroupMemberList')
      queryClient.invalidateEndpoint('antiAffinityGroupView')
      addToast(<>Member <HL>{variables.path.instance}</HL> added to anti-affinity group <HL>{antiAffinityGroup}</HL></>) // prettier-ignore
    },
  })

  return (
    <Modal isOpen={isModalOpen} onDismiss={onDismiss} title="Add instance to group">
      <Modal.Body>
        <Modal.Section>
          <p className="text-sm text-gray-500">
            Select an instance to add to the anti-affinity group{' '}
            <HL>{antiAffinityGroup}</HL>.
          </p>
          <ComboboxField
            label="Instance"
            placeholder="Select an instance"
            name="antiAffinityGroupMember"
            items={toComboboxItems(availableInstances)}
            required
            control={form.control}
          />
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        onDismiss={onDismiss}
        onAction={() =>
          addMember({
            path: {
              antiAffinityGroup,
              instance: form.getValues('antiAffinityGroupMember'),
            },
            query: { project },
          })
        }
        actionText="Add to group"
      />
    </Modal>
  )
}
