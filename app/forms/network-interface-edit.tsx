/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { match } from 'ts-pattern'

import {
  api,
  q,
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
import { SkeletonCell } from '~/table/cells/EmptyCell'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { FormDivider } from '~/ui/lib/Divider'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import { Message } from '~/ui/lib/Message'
import { ClearAndAddButtons, MiniTable } from '~/ui/lib/MiniTable'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { HintLink, TextInputHint } from '~/ui/lib/TextInput'
import { KEYS } from '~/ui/util/keys'
import { parseIpNet, validateIpNet } from '~/util/ip'
import { docLinks, links } from '~/util/links'

const transitIpTableColumns = [{ header: 'Transit IPs', cell: (ip: string) => ip }]

// The NIC's subnet stores only an ID; look up the name for display. The
// networking tab that opens this form prefetches subnet views by ID, so this
// usually hits a warm cache.
const SubnetNameFromId = ({ subnetId }: { subnetId: string }) => {
  const { data: subnet } = useQuery(
    q(api.vpcSubnetView, { path: { subnet: subnetId } }, { throwOnError: false })
  )
  if (!subnet) return <SkeletonCell />
  return subnet.name
}

// IP addresses aren't editable — a new interface must be created to change them
// — so surface them as read-only metadata. A NIC has a v4 address, a v6
// address, or both, depending on its stack type.
const privateIps = (ipStack: InstanceNetworkInterface['ipStack']) =>
  match(ipStack)
    .with({ type: 'v4' }, ({ value }) => ({ v4: value.ip, v6: undefined }))
    .with({ type: 'v6' }, ({ value }) => ({ v4: undefined, v6: value.ip }))
    .with({ type: 'dual_stack' }, ({ value }) => ({ v4: value.v4.ip, v6: value.v6.ip }))
    .exhaustive()

type EditNetworkInterfaceFormProps = {
  editing: InstanceNetworkInterface
  onDismiss: () => void
}

export function EditNetworkInterfaceForm({
  onDismiss,
  editing,
}: EditNetworkInterfaceFormProps) {
  const instanceSelector = useInstanceSelector()
  const ips = privateIps(editing.ipStack)

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
      ? [...editing.ipStack.value.v4.transitIps, ...editing.ipStack.value.v6.transitIps]
      : editing.ipStack.value.transitIps

  const defaultValues = {
    name: editing.name,
    description: editing.description,
    transitIps: extractedTransitIps,
  } satisfies InstanceNetworkInterfaceUpdate

  const form = useForm({ defaultValues })
  const transitIps = form.watch('transitIps') || []

  // Determine what IP versions this NIC supports
  const { ipStack } = editing
  const { supportedVersions, exampleIPs } = match(ipStack.type)
    .with('v4', () => ({ supportedVersions: 'IPv4', exampleIPs: '192.168.0.0/16' }))
    .with('v6', () => ({ supportedVersions: 'IPv6', exampleIPs: 'fd00::/64' }))
    .with('dual_stack', () => ({
      supportedVersions: 'both IPv4 and IPv6',
      exampleIPs: '192.168.0.0/16 or fd00::/64',
    }))
    .exhaustive()

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
      <PropertiesTable>
        <PropertiesTable.IdRow id={editing.id} />
        <PropertiesTable.DateRow label="Created" date={editing.timeCreated} />
        <PropertiesTable.DateRow label="Updated" date={editing.timeModified} />
        {ips.v4 && (
          <PropertiesTable.Row label="Private IPv4">
            <CopyableIp ip={ips.v4} isLinked={false} />
          </PropertiesTable.Row>
        )}
        {ips.v6 && (
          <PropertiesTable.Row label="Private IPv6">
            <CopyableIp ip={ips.v6} isLinked={false} />
          </PropertiesTable.Row>
        )}
        <PropertiesTable.Row label="MAC address">{editing.mac}</PropertiesTable.Row>
        <PropertiesTable.Row label="Subnet">
          <SubnetNameFromId subnetId={editing.subnetId} />
        </PropertiesTable.Row>
      </PropertiesTable>
      <FormDivider />
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
            These allow an instance to opt into traffic from a wider address range. Learn
            more in the <HintLink href={links.transitIpsDocs}>Networking</HintLink> guide.
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

              // Check if transit IP version matches NIC's stack type
              const parsed = parseIpNet(value)
              if (parsed.type === 'v4' && ipStack.type === 'v6') {
                return 'IPv4 transit IP not supported by this network interface'
              }
              if (parsed.type === 'v6' && ipStack.type === 'v4') {
                return 'IPv6 transit IP not supported by this network interface'
              }

              if (transitIps.includes(value)) return 'Transit IP already in list'
            }}
            placeholder={`An IP network, e.g., ${exampleIPs}`}
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
        columns={transitIpTableColumns}
        rowKey={(ip) => ip}
        onRemoveItem={(ip) => {
          form.setValue(
            'transitIps',
            transitIps.filter((item) => item !== ip)
          )
        }}
        removeLabel={(ip) => `remove IP ${ip}`}
      />
      <Message
        variant="info"
        content={`This network interface supports ${supportedVersions} transit IPs.`}
      />
      <SideModalFormDocs docs={[docLinks.networkInterfaces, docLinks.vpcs]} />
    </SideModalForm>
  )
}
