/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useId } from 'react'
import { useForm } from 'react-hook-form'

import { queryClient, useApiMutation, type Instance } from '~/api'
import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { HL } from '~/components/HL'
import { useAntiAffinityGroupSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { toComboboxItems } from '~/ui/lib/Combobox'
import { Modal } from '~/ui/lib/Modal'

type Values = { instance: string }

const defaultValues: Values = { instance: '' }

type Props = { instances: Instance[]; onDismiss: () => void }

export default function AddAntiAffinityGroupMemberForm({ instances, onDismiss }: Props) {
  const { project, antiAffinityGroup } = useAntiAffinityGroupSelector()

  const form = useForm({ defaultValues })
  const formId = useId()

  const { mutateAsync: addMember } = useApiMutation('antiAffinityGroupMemberInstanceAdd', {
    onSuccess(_data, variables) {
      onDismiss()
      queryClient.invalidateEndpoint('antiAffinityGroupMemberList')
      queryClient.invalidateEndpoint('instanceAntiAffinityGroupList')
      addToast(<>Instance <HL>{variables.path.instance}</HL> added to anti-affinity group <HL>{antiAffinityGroup}</HL></>) // prettier-ignore
    },
  })

  const onSubmit = form.handleSubmit(({ instance }) => {
    addMember({
      path: { antiAffinityGroup, instance },
      query: { project },
    })
  })

  return (
    <Modal isOpen onDismiss={onDismiss} title="Add instance to group">
      <Modal.Body>
        <Modal.Section>
          <p className="text-sm text-gray-500">
            Select an instance to add to the anti-affinity group{' '}
            <HL>{antiAffinityGroup}</HL>. Only stopped instances can be added to the group.
          </p>
          <form id={formId} onSubmit={onSubmit}>
            <ComboboxField
              placeholder="Select an instance"
              name="instance"
              label="Instance"
              items={toComboboxItems(instances)}
              required
              control={form.control}
            />
          </form>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer onDismiss={onDismiss} actionText="Add to group" formId={formId} />
    </Modal>
  )
}
