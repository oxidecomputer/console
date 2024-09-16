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
import { Button } from '~/ui/lib/Button'
import { FormDivider } from '~/ui/lib/Divider'
import * as MiniTable from '~/ui/lib/MiniTable'
import { TextInputHint } from '~/ui/lib/TextInput'
import { KEYS } from '~/ui/util/keys'
import { links } from '~/util/links'

// The "Clear" and "Add …" buttons that appear below the filter input fields
const ClearAndAddButtons = ({
  isDirty,
  onClear,
  onSubmit,
  buttonCopy,
}: {
  isDirty: boolean
  onClear: () => void
  onSubmit: () => void
  buttonCopy: string
}) => (
  <div className="flex justify-end">
    <Button
      variant="ghost"
      size="sm"
      className="mr-2.5"
      disabled={!isDirty}
      onClick={onClear}
    >
      Clear
    </Button>
    <Button size="sm" onClick={onSubmit}>
      {buttonCopy}
    </Button>
  </div>
)

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

  const transitIpsForm = useForm({ defaultValues: { transitIp: '' } })

  const submitTransitIp = () => {
    const transitIp = transitIpsForm.getValues('transitIp')
    if (!transitIp) return
    form.setValue('transitIps', [...transitIps, transitIp])
    transitIpsForm.reset()
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
        {/* We have to blow this up instead of using TextField to get better text styling on the label */}
        <div className="mt-2">
          <label id="transitIps-label" htmlFor="transitIp" className="text-sans-lg">
            Transit IPs
          </label>
          <TextInputHint id="transitIps-help-text" className="mb-2">
            Enter an IPv4 or IPv6 address.{' '}
            <a href={links.transitIpsDocs} target="_blank" rel="noreferrer">
              Learn more about transit IPs.
            </a>
          </TextInputHint>
          <TextFieldInner
            id="transitIp"
            name="transitIp"
            required
            control={transitIpsForm.control}
            onKeyDown={(e) => {
              if (e.key === KEYS.enter) {
                e.preventDefault() // prevent full form submission
                submitTransitIp()
              }
            }}
          />
        </div>
        <ClearAndAddButtons
          isDirty={!!transitIpsForm.formState.dirtyFields.transitIp}
          onClear={transitIpsForm.reset}
          onSubmit={submitTransitIp}
          buttonCopy="Add Transit IP"
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
