/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import * as R from 'remeda'

import {
  useApiMutation,
  useApiQueryClient,
  type InstanceNetworkInterface,
  type InstanceNetworkInterfaceUpdate,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { useInstanceSelector } from '~/hooks/use-params'
import { FormDivider } from '~/ui/lib/Divider'
import * as MiniTable from '~/ui/lib/MiniTable'

type EditNetworkInterfaceFormProps = {
  editing: InstanceNetworkInterface
  onDismiss: () => void
}

export function EditNetworkInterfaceForm({
  onDismiss,
  editing,
}: EditNetworkInterfaceFormProps) {
  const queryClient = useApiQueryClient()
  const instanceSelector = useInstanceSelector()

  const editNetworkInterface = useApiMutation('instanceNetworkInterfaceUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('instanceNetworkInterfaceList')
      onDismiss()
    },
  })

  const defaultValues = R.pick(editing, [
    'name',
    'description',
    'transitIps',
  ]) satisfies InstanceNetworkInterfaceUpdate

  const form = useForm({ defaultValues })
  const transitIps = form.watch('transitIps')

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="network interface"
      onDismiss={onDismiss}
      onSubmit={(body) => {
        const interfaceName = defaultValues.name
        editNetworkInterface.mutate({
          path: { interface: interfaceName },
          query: instanceSelector,
          body,
        })
      }}
      loading={editNetworkInterface.isPending}
      submitError={editNetworkInterface.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <FormDivider />
      {transitIps && (
        <MiniTable.Table className="mb-4" aria-label="Transit IPs">
          <MiniTable.Header>
            <MiniTable.HeadCell>Transit IPs</MiniTable.HeadCell>
            {/* For remove button */}
            <MiniTable.HeadCell className="w-12" />
          </MiniTable.Header>
          <MiniTable.Body>
            {transitIps.map((ip, index) => (
              <MiniTable.Row
                tabIndex={0}
                aria-rowindex={index + 1}
                aria-label={ip}
                key={ip}
              >
                <MiniTable.Cell>{ip}</MiniTable.Cell>
                <MiniTable.RemoveCell
                  onClick={() => {
                    console.log('this does, in fact, need to do something')
                  }}
                  label={`remove IP ${ip}`}
                />
              </MiniTable.Row>
            ))}
          </MiniTable.Body>
        </MiniTable.Table>
      )}
    </SideModalForm>
  )
}
