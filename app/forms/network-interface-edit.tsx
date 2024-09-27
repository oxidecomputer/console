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
import { TextFieldInner } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { useInstanceSelector } from '~/hooks/use-params'
import { FormDivider } from '~/ui/lib/Divider'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import * as MiniTable from '~/ui/lib/MiniTable'
import { TextInputHint } from '~/ui/lib/TextInput'
import { KEYS } from '~/ui/util/keys'
import { links } from '~/util/links'

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
  const transitIps = form.watch('transitIps') || []

  const addTransitIpForm = useForm({ defaultValues: { transitIp: '' } })
  const addTransitIpFieldValue = addTransitIpForm.watch('transitIp').trim()

  const submitTransitIp = () => {
    if (!addTransitIpFieldValue) return
    // only add the IP if it isn't already in the list of transit IPs
    if (!transitIps.includes(addTransitIpFieldValue)) {
      form.setValue('transitIps', [...transitIps, addTransitIpFieldValue])
    }
    addTransitIpForm.reset()
  }

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

      <div className="flex flex-col gap-3">
        {/* We have to blow this up instead of using TextField for better layout control of field and ClearAndAddButtons */}
        <div>
          <FieldLabel id="transitIp-label" htmlFor="transitIp" optional>
            Transit IPs
          </FieldLabel>
          <TextInputHint id="transitIp-help-text" className="mb-2">
            Enter an IPv4 or IPv6 address.{' '}
            <a href={links.transitIpsDocs} target="_blank" rel="noreferrer">
              Learn more about transit IPs.
            </a>
          </TextInputHint>
          <TextFieldInner
            id="transitIp"
            name="transitIp"
            control={addTransitIpForm.control}
            onKeyDown={(e) => {
              if (e.key === KEYS.enter) {
                e.preventDefault() // prevent full form submission
                submitTransitIp()
              }
            }}
          />
        </div>
        <MiniTable.ClearAndAddButtons
          addButtonCopy="Add Transit IP"
          disableClear={!addTransitIpFieldValue}
          onClear={() => addTransitIpForm.reset({ transitIp: '' })}
          onSubmit={submitTransitIp}
        />
      </div>
      {transitIps.length > 0 && (
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
                  label={`remove IP ${ip}`}
                  onClick={() => {
                    form.setValue(
                      'transitIps',
                      transitIps.filter((item) => item !== ip)
                    )
                  }}
                />
              </MiniTable.Row>
            ))}
          </MiniTable.Body>
        </MiniTable.Table>
      )}
    </SideModalForm>
  )
}
