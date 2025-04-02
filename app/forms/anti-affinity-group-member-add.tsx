/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useForm } from 'react-hook-form'
import type { LoaderFunctionArgs } from 'react-router'

import { apiq, queryClient, useApiMutation, usePrefetchedQuery } from '~/api'
import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { HL } from '~/components/HL'
import {
  getAntiAffinityGroupSelector,
  useAntiAffinityGroupSelector,
} from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { toComboboxItems } from '~/ui/lib/Combobox'
import { Modal } from '~/ui/lib/Modal'
import { ALL_ISH } from '~/util/consts'
import type * as PP from '~/util/path-params'

const memberList = ({ antiAffinityGroup, project }: PP.AntiAffinityGroup) =>
  apiq('antiAffinityGroupMemberList', {
    path: { antiAffinityGroup },
    // member limit in DB is currently 32, so pagination isn't needed
    query: { project, limit: ALL_ISH },
  })
const instanceList = ({ project }: PP.Project) =>
  apiq('instanceList', { query: { project, limit: ALL_ISH } })
const affinityGroupList = ({ project }: PP.Project) =>
  apiq('affinityGroupList', { query: { project, limit: ALL_ISH } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { antiAffinityGroup, project } = getAntiAffinityGroupSelector(params)
  await Promise.all([
    queryClient.fetchQuery(memberList({ antiAffinityGroup, project })),
    queryClient.prefetchQuery(instanceList({ project })),
    queryClient.prefetchQuery(affinityGroupList({ project })),
  ])
  return null
}

export function AddAntiAffinityGroupMemberForm({
  isModalOpen,
  setIsModalOpen,
}: {
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

  const { data: members } = usePrefetchedQuery(memberList({ antiAffinityGroup, project }))

  // We need to construct a list of availableInstances. These should not include any
  // instances already in this anti-affinity group. They should also not include any
  // instances that are already in an affinity group that is included in this list.
  const { data: instances } = usePrefetchedQuery(instanceList({ project }))
  const availableInstances = toComboboxItems(
    instances.items.filter((instance) => {
      const isInThisGroup = members.items.some(({ value }) => value.name === instance.name)
      // TODO: Check if the instance is already in an affinity group that is in this anti-affinity group
      return !isInThisGroup
    })
  )

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
            items={availableInstances}
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
