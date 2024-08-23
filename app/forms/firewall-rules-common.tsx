/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useController, type Control } from 'react-hook-form'

import {
  useApiQueryClient,
  type ApiError,
  type Instance,
  type Vpc,
  type VpcFirewallRuleHostFilter,
  type VpcFirewallRuleTarget,
} from '~/api'
import { parsePortRange } from '~/api/util'
import { CheckboxField } from '~/components/form/fields/CheckboxField'
import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { NumberField } from '~/components/form/fields/NumberField'
import { RadioField } from '~/components/form/fields/RadioField'
import { TextField, TextFieldInner } from '~/components/form/fields/TextField'
import { useVpcSubnetItems } from '~/components/form/fields/useItemsList'
import { useForm } from '~/hooks/use-form'
import { Badge } from '~/ui/lib/Badge'
import { Button } from '~/ui/lib/Button'
import { toComboboxItem } from '~/ui/lib/Combobox'
import { FormDivider } from '~/ui/lib/Divider'
import { Message } from '~/ui/lib/Message'
import * as MiniTable from '~/ui/lib/MiniTable'
import { TextInputHint } from '~/ui/lib/TextInput'
import { KEYS } from '~/ui/util/keys'
import { links } from '~/util/links'
import { capitalize } from '~/util/str'

import { type FirewallRuleValues } from './firewall-rules-util'

type PortRangeFormValues = {
  portRange: string
}

const portRangeDefaultValues: PortRangeFormValues = {
  portRange: '',
}

type HostFormValues = {
  type: VpcFirewallRuleHostFilter['type']
  value: string
  subnetVpc?: string
}

const hostDefaultValues: HostFormValues = {
  type: 'vpc',
  value: '',
}

type TargetFormValues = {
  type: VpcFirewallRuleTarget['type']
  value: string
  subnetVpc?: string
}

const targetDefaultValues: TargetFormValues = {
  type: 'vpc',
  value: '',
}

type CommonFieldsProps = {
  error: ApiError | null
  control: Control<FirewallRuleValues>
  project: string
  instances: Array<Instance>
  vpcs: Array<Vpc>
  nameTaken: (name: string) => boolean
}

const targetAndHostItems = [
  { value: 'vpc', label: 'VPC' },
  { value: 'subnet', label: 'VPC Subnet' },
  { value: 'instance', label: 'Instance' },
  { value: 'ip', label: 'IP' },
  { value: 'ip_net', label: 'IP subnet' },
]

const getFilterValueProps = (
  hostType: VpcFirewallRuleHostFilter['type'],
  sectionType: 'target' | 'host'
) => {
  switch (hostType) {
    case 'vpc':
      return {
        label: 'VPC name',
        placeholder: 'Select a VPC',
        ariaLabel: `Select ${sectionType} VPC name`,
      }
    case 'subnet':
      return {
        label: 'Subnet name',
        placeholder: 'Select a VPC subnet',
        ariaLabel: `Select ${sectionType} subnet name`,
      }
    case 'instance':
      return {
        label: 'Instance name',
        placeholder: 'Select an instance',
        ariaLabel: `Select ${sectionType} instance name`,
      }
    case 'ip':
      return {
        label: 'IP address',
        helpText: 'An IPv4 or IPv6 address',
        placeholder: 'Enter an IP address',
        ariaLabel: `Enter ${sectionType} IP address`,
      }
    case 'ip_net':
      return {
        label: 'IP network',
        helpText: 'Looks like 192.168.0.0/16 or fd00:1122:3344:0001::1/64',
        placeholder: 'Enter an IP network',
        ariaLabel: `Enter ${sectionType} IP network`,
      }
  }
}

const DocsLinkMessage = () => (
  <Message
    variant="info"
    content={
      <>
        Read the{' '}
        <a
          href={links.firewallRulesDocs}
          // don't need color and hover color because message text is already color-info anyway
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          guest networking guide
        </a>{' '}
        and{' '}
        <a
          href="https://docs.oxide.computer/api/vpc_firewall_rules_update"
          // don't need color and hover color because message text is already color-info anyway
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          API docs
        </a>{' '}
        to learn more about firewall rules.
      </>
    }
  />
)

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

export const CommonFields = ({
  error,
  control,
  nameTaken,
  project,
  instances,
  vpcs,
}: CommonFieldsProps) => {
  const portRangeForm = useForm({ defaultValues: portRangeDefaultValues })
  const ports = useController({ name: 'ports', control }).field
  const submitPortRange = portRangeForm.handleSubmit(({ portRange }) => {
    const portRangeValue = portRange.trim()
    // at this point we've already validated in validate() that it parses and
    // that it is not already in the list
    ports.onChange([...ports.value, portRangeValue])
    portRangeForm.reset()
  })

  const hostForm = useForm({ defaultValues: hostDefaultValues })
  const hosts = useController({ name: 'hosts', control }).field
  const submitHost = hostForm.handleSubmit(({ type, value }) => {
    // ignore click if empty or a duplicate
    // TODO: show error instead of ignoring click
    if (!type || !value) return
    if (hosts.value.some((t) => t.value === value && t.type === type)) return

    hosts.onChange([...hosts.value, { type, value }])
    hostForm.reset()
  })

  const targetForm = useForm({ defaultValues: targetDefaultValues })
  const targets = useController({ name: 'targets', control }).field

  const targetType = targetForm.watch('type')
  const targetSubnetVpc = targetForm.watch('subnetVpc')

  const { items: targetVpcSubnets } = useVpcSubnetItems({ project, vpc: targetSubnetVpc })

  const targetFilterItems = {
    vpc: vpcs.map((v) => ({ value: v.name, label: v.name })),
    subnet: targetVpcSubnets?.filter(
      ({ label }: { label: string }) => !targets.value.map((t) => t.value).includes(label)
    ),
    instance: instances.map((i) => toComboboxItem(i.name)),
    ip: [],
    ip_net: [],
  }

  const submitTarget = targetForm.handleSubmit(({ type, value }) => {
    // TODO: do this with a normal validation
    // ignore click if empty or a duplicate
    // TODO: show error instead of ignoring click
    if (!type || !value) return
    if (targets.value.some((t) => t.value === value && t.type === type)) return

    targets.onChange([...targets.value, { type, value }])
    targetForm.reset()
  })

  const queryClient = useApiQueryClient()
  const hostType = hostForm.watch('type')
  const hostSubnetVpc = hostForm.watch('subnetVpc')

  const { items: hostVpcSubnets } = useVpcSubnetItems({ project, vpc: hostSubnetVpc })
  const hostFilterItems = {
    vpc: vpcs.map((v) => ({ value: v.name, label: v.name })),
    // filter out subnets that are already targets
    subnet: hostVpcSubnets?.filter(
      ({ label }: { label: string }) => !hosts.value.map((h) => h.value).includes(label)
    ),
    instance: instances.map((i) => toComboboxItem(i.name)),
    ip: [],
    ip_net: [],
  }

  const DynamicTypeAndValueFields = ({
    sectionType,
    control,
    onTypeChange,
    valueType,
    items,
    onInputChange,
    isDisabled,
  }: {
    sectionType: 'target' | 'host'
    control: Control<TargetFormValues | HostFormValues>
    onTypeChange: () => void
    valueType: VpcFirewallRuleHostFilter['type']
    items: Array<{ value: string; label: string }>
    onInputChange?: (value: string) => void
    isDisabled?: boolean
  }) => {
    return (
      <>
        <ListboxField
          name="type"
          label={`${capitalize(sectionType)} type`}
          required
          control={control}
          items={targetAndHostItems}
          onChange={onTypeChange}
        />
        {/* If specifying a subnet, they must first select the VPC that owns the subnet */}
        {valueType === 'subnet' && (
          <ListboxField
            name="subnetVpc"
            label="VPC"
            aria-label={`Select ${sectionType} VPC`}
            required
            control={control}
            items={vpcs.map((v) => toComboboxItem(v.name))}
            // when this changes, we need to re-fetch the subnet list
            onChange={() => {
              queryClient.invalidateQueries('vpcSubnetList')
            }}
            placeholder="Select a VPC"
          />
        )}
        {/* In the firewall rules form, these types get comboboxes instead of text fields */}
        {['vpc', 'subnet', 'instance'].includes(valueType) ? (
          <ComboboxField
            disabled={isDisabled}
            name="value"
            {...getFilterValueProps(valueType, sectionType)}
            required
            control={control}
            onInputChange={onInputChange}
            items={items}
            showNoMatchPlaceholder={false}
            // TODO: validate here, but it's complicated because it's conditional
            // on which type is selected
          />
        ) : (
          <TextField
            name="value"
            aria-label={``}
            {...getFilterValueProps(valueType, sectionType)}
            required
            control={control}
            onKeyDown={(e) => {
              if (e.key === KEYS.enter) {
                e.preventDefault() // prevent full form submission
                submitTarget(e)
              }
            }}
            // TODO: validate here, but it's complicated because it's conditional
            // on which type is selected
          />
        )}
      </>
    )
  }

  const TypeAndValueTableHeader = () => (
    <MiniTable.Header>
      <MiniTable.HeadCell>Type</MiniTable.HeadCell>
      <MiniTable.HeadCell>Value</MiniTable.HeadCell>
      {/* For remove button */}
      <MiniTable.HeadCell className="w-12" />
    </MiniTable.Header>
  )

  const TypeAndValueTableRow = ({
    type,
    value,
    index,
    onRemove,
    targetOrHost,
  }: {
    type: string
    value: string
    index: number
    onRemove: () => void
    targetOrHost: 'target' | 'host'
  }) => (
    <MiniTable.Row
      tabIndex={0}
      aria-rowindex={index + 1}
      aria-label={`Name: ${value}, Type: ${type}`}
      key={`${type}|${value}`}
    >
      <MiniTable.Cell>
        <Badge variant="solid">{type}</Badge>
      </MiniTable.Cell>
      <MiniTable.Cell>{value}</MiniTable.Cell>
      <MiniTable.RemoveCell onClick={onRemove} label={`remove ${targetOrHost} ${value}`} />
    </MiniTable.Row>
  )

  return (
    <>
      <DocsLinkMessage />
      {/* omitting value prop makes it a boolean value. beautiful */}
      {/* TODO: better text or heading or tip or something on this checkbox */}
      <CheckboxField name="enabled" control={control}>
        Enabled
      </CheckboxField>
      <NameField
        name="name"
        control={control}
        validate={(name) => {
          if (nameTaken(name)) {
            // TODO: might be worth mentioning that the names are unique per VPC as opposed to globally
            return 'Name taken. To update an existing rule, edit it directly.'
          }
        }}
      />
      <DescriptionField name="description" control={control} />

      <RadioField
        name="action"
        column
        control={control}
        items={[
          { value: 'allow', label: 'Allow' },
          { value: 'deny', label: 'Deny' },
        ]}
      />
      <RadioField
        name="direction"
        label="Direction of traffic"
        column
        control={control}
        description={
          <>
            An inbound rule applies to traffic <em>to</em> the targets, while an outbound
            rule applies to traffic <em>from</em> the targets.
          </>
        }
        items={[
          { value: 'inbound', label: 'Inbound' },
          { value: 'outbound', label: 'Outbound' },
        ]}
      />
      <NumberField
        name="priority"
        description="Must be 0&ndash;65535. Lower-numbered rules apply first."
        required
        control={control}
      />

      <FormDivider />

      {/* Really this should be its own <form>, but you can't have a form inside a form,
          so we just stick the submit handler in a button onClick */}
      <div className="flex flex-col gap-3">
        <h3 className="mb-4 text-sans-2xl">Targets</h3>
        <Message
          variant="info"
          content={
            <>
              Targets determine the instances to which this rule applies. You can target
              instances directly by name, or specify a VPC, VPC subnet, IP, or IP subnet,
              which will apply the rule to traffic going to all matching instances. Targets
              are additive: the rule applies to instances matching{' '}
              <span className="underline">any</span> target.
            </>
          }
        />
        <DynamicTypeAndValueFields
          sectionType="target"
          control={targetForm.control}
          onTypeChange={() => targetForm.setValue('value', '')}
          valueType={targetType}
          items={targetFilterItems[targetType]}
          onInputChange={(value) => targetForm.setValue('value', value)}
          isDisabled={targetType === 'subnet' && !targetSubnetVpc}
        />
        <ClearAndAddButtons
          isDirty={targetForm.formState.isDirty}
          onClear={() => targetForm.reset()}
          onSubmit={submitTarget}
          buttonCopy="Add target filter"
        />
      </div>

      {!!targets.value.length && (
        <MiniTable.Table className="mb-4" aria-label="Targets">
          <TypeAndValueTableHeader />
          <MiniTable.Body>
            {targets.value.map((t, index) => (
              <TypeAndValueTableRow
                key={`${t.type}|${t.value}`}
                type={t.type}
                value={t.value}
                index={index}
                onRemove={() =>
                  targets.onChange(
                    targets.value.filter((i) => !(i.value === t.value && i.type === t.type))
                  )
                }
                targetOrHost="target"
              />
            ))}
          </MiniTable.Body>
        </MiniTable.Table>
      )}

      <FormDivider />

      <h3 className="mb-4 text-sans-2xl">Filters</h3>

      <Message
        variant="info"
        content={
          <>
            Filters reduce the scope of this rule. Without filters, the rule applies to all
            traffic to the targets (or from the targets, if it&rsquo;s an outbound rule).
            With multiple filter types, the rule applies to traffic matching at least one
            filter of <span className="underline">every</span> type.
          </>
        }
      />

      <div className="flex flex-col gap-3">
        {/* We have to blow this up instead of using TextField to get better 
            text styling on the label */}
        <div className="mt-2">
          <label id="portRange-label" htmlFor="portRange" className="text-sans-lg">
            Port filters
          </label>
          <TextInputHint id="portRange-help-text" className="mb-2">
            A single destination port (1234) or a range (1234&ndash;2345)
          </TextInputHint>
          <TextFieldInner
            id="portRange"
            name="portRange"
            required
            control={portRangeForm.control}
            onKeyDown={(e) => {
              if (e.key === KEYS.enter) {
                e.preventDefault() // prevent full form submission
                submitPortRange(e)
              }
            }}
            validate={(value) => {
              if (!parsePortRange(value)) return 'Not a valid port range'
              if (ports.value.includes(value.trim())) return 'Port range already added'
            }}
          />
        </div>
        <ClearAndAddButtons
          isDirty={portRangeForm.formState.isDirty}
          onClear={portRangeForm.reset}
          onSubmit={submitPortRange}
          buttonCopy="Add port filter"
        />
      </div>

      {!!ports.value.length && (
        <MiniTable.Table className="mb-4" aria-label="Port filters">
          <MiniTable.Header>
            <MiniTable.HeadCell>Port ranges</MiniTable.HeadCell>
            {/* For remove button */}
            <MiniTable.HeadCell className="w-12" />
          </MiniTable.Header>
          <MiniTable.Body>
            {ports.value.map((p) => (
              <MiniTable.Row tabIndex={0} aria-label={p} key={p}>
                <MiniTable.Cell>{p}</MiniTable.Cell>
                <MiniTable.RemoveCell
                  onClick={() => ports.onChange(ports.value.filter((p1) => p1 !== p))}
                  label={`remove port ${p}`}
                />
              </MiniTable.Row>
            ))}
          </MiniTable.Body>
        </MiniTable.Table>
      )}

      <fieldset className="space-y-0.5">
        <legend className="mb-2 mt-4 text-sans-lg">Protocol filters</legend>
        <div>
          <CheckboxField name="protocols" value="TCP" control={control}>
            TCP
          </CheckboxField>
        </div>
        <div>
          <CheckboxField name="protocols" value="UDP" control={control}>
            UDP
          </CheckboxField>
        </div>
        <div>
          <CheckboxField name="protocols" value="ICMP" control={control}>
            ICMP
          </CheckboxField>
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <h3 className="mt-4 text-sans-lg">Host filters</h3>
        <Message
          variant="info"
          content={
            <>
              Host filters match the &ldquo;other end&rdquo; of traffic from the
              target&rsquo;s perspective: for an inbound rule, they match the source of
              traffic. For an outbound rule, they match the destination.
            </>
          }
        />
        <DynamicTypeAndValueFields
          sectionType="host"
          control={hostForm.control}
          onTypeChange={() => hostForm.setValue('value', '')}
          valueType={hostType}
          items={hostFilterItems[hostType]}
          onInputChange={(value) => hostForm.setValue('value', value)}
          isDisabled={hostType === 'subnet' && !hostSubnetVpc}
        />
        <ClearAndAddButtons
          isDirty={hostForm.formState.isDirty}
          onClear={() => hostForm.reset()}
          onSubmit={submitHost}
          buttonCopy="Add host filter"
        />

        {!!hosts.value.length && (
          <MiniTable.Table className="mb-4" aria-label="Host filters">
            <TypeAndValueTableHeader />
            <MiniTable.Body>
              {hosts.value.map((h, index) => (
                <TypeAndValueTableRow
                  key={`${h.type}|${h.value}`}
                  type={h.type}
                  value={h.value}
                  index={index}
                  onRemove={() =>
                    hosts.onChange(
                      hosts.value.filter((i) => !(i.value === h.value && i.type === h.type))
                    )
                  }
                  targetOrHost="host"
                />
              ))}
            </MiniTable.Body>
          </MiniTable.Table>
        )}
      </div>

      {error && (
        <>
          <FormDivider />
          <div className="text-destructive">{error.message}</div>
        </>
      )}
    </>
  )
}
