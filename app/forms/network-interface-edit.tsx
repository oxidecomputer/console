/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import {
  api,
  queryClient,
  useApiMutation,
  type InstanceNetworkInterface,
  type InstanceNetworkInterfaceUpdate,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { TextFieldInner } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { useInstanceSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { FormDivider } from '~/ui/lib/Divider'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import { ClearAndAddButtons, MiniTable } from '~/ui/lib/MiniTable'
import { TextInputHint } from '~/ui/lib/TextInput'
import { KEYS } from '~/ui/util/keys'
import { validateIpNet } from '~/util/ip'
import { links } from '~/util/links'

type EditNetworkInterfaceFormProps = {
  editing: InstanceNetworkInterface
  onDismiss: () => void
}

export function EditNetworkInterfaceForm({
  onDismiss,
  editing,
}: EditNetworkInterfaceFormProps) {
  const instanceSelector = useInstanceSelector()

  const editNetworkInterface = useApiMutation(api.instanceNetworkInterfaceUpdate, {
    onSuccess(nic) {
      queryClient.invalidateEndpoint('instanceNetworkInterfaceList')
      // prettier-ignore
      addToast(<>Network interface <HL>{nic.name}</HL> updated</>)
      onDismiss()
    },
  })

  // Extract transitIps from ipStack for the form
  const extractedTransitIps =
    editing.ipStack.type === 'dual_stack'
      ? editing.ipStack.value.v4.transitIps
      : editing.ipStack.value.transitIps

  const defaultValues = {
    name: editing.name,
    description: editing.description,
    transitIps: extractedTransitIps,
  } satisfies InstanceNetworkInterfaceUpdate

  const form = useForm({ defaultValues })
  const transitIps = form.watch('transitIps') || []

  const transitIpsForm = useForm({ defaultValues: { transitIp: '' } })
  const transitIpValue = transitIpsForm.watch('transitIp')
  const { isSubmitSuccessful: transitIpSubmitSuccessful } = transitIpsForm.formState

  const submitTransitIp = transitIpsForm.handleSubmit(({ transitIp }) => {
    // validate has already checked to make sure it's not in the list
    form.setValue('transitIps', [...transitIps, transitIp])
    transitIpsForm.reset()
  })

  useEffect(() => {
    if (transitIpSubmitSuccessful) transitIpsForm.reset()
  }, [transitIpSubmitSuccessful, transitIpsForm])

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
            An IP network, like 192.168.0.0/16.{' '}
            <a href={links.transitIpsDocs} target="_blank" rel="noreferrer">
              Learn more about transit IPs.
            </a>
          </TextInputHint>
          <TextFieldInner
            id="transitIp"
            name="transitIp"
            control={transitIpsForm.control}
            onKeyDown={(e) => {
              if (e.key === KEYS.enter) {
                e.preventDefault() // prevent full form submission
                submitTransitIp()
              }
            }}
            validate={(value) => {
              const error = validateIpNet(value)
              if (error) return error

              if (transitIps.includes(value)) return 'Transit IP already in list'
            }}
            placeholder="Enter an IP network"
          />
        </div>
        <ClearAndAddButtons
          addButtonCopy="Add Transit IP"
          disabled={!transitIpValue}
          onClear={() => transitIpsForm.reset()}
          onSubmit={submitTransitIp}
        />
      </div>
      <MiniTable
        className="mb-4"
        ariaLabel="Transit IPs"
        items={transitIps}
        columns={[{ header: 'Transit IPs', cell: (ip) => ip }]}
        rowKey={(ip) => ip}
        onRemoveItem={(ip) => {
          form.setValue(
            'transitIps',
            transitIps.filter((item) => item !== ip)
          )
        }}
        removeLabel={(ip) => `remove IP ${ip}`}
      />
    </SideModalForm>
  )
}
