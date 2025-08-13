/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect } from 'react'
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
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { useInstanceSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { FormDivider } from '~/ui/lib/Divider'
import { ClearAndAddButtons, MiniTable } from '~/ui/lib/MiniTable'
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
  const queryClient = useApiQueryClient()
  const instanceSelector = useInstanceSelector()

  const editNetworkInterface = useApiMutation('instanceNetworkInterfaceUpdate', {
    onSuccess(nic) {
      queryClient.invalidateQueries('instanceNetworkInterfaceList')
      addToast(<>Network interface <HL>{nic.name}</HL> updated</>) // prettier-ignore
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
        <TextField
          name="transitIp"
          label="Transit IPs"
          description={
            <>
              An IP network, like 192.168.0.0/16.{' '}
              <a href={links.transitIpsDocs} target="_blank" rel="noreferrer">
                Learn more about transit IPs.
              </a>
            </>
          }
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
