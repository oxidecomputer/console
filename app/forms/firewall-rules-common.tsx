/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import {
  useController,
  useForm,
  type Control,
  type ControllerRenderProps,
} from 'react-hook-form'

import {
  usePrefetchedApiQuery,
  type ApiError,
  type Instance,
  type Vpc,
  type VpcFirewallRuleHostFilter,
  type VpcFirewallRuleTarget,
  type VpcSubnet,
} from '~/api'
import { parsePortRange } from '~/api/util'
import { CheckboxField } from '~/components/form/fields/CheckboxField'
import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField, validateName } from '~/components/form/fields/NameField'
import { NumberField } from '~/components/form/fields/NumberField'
import { RadioField } from '~/components/form/fields/RadioField'
import { TextField, TextFieldInner } from '~/components/form/fields/TextField'
import { useVpcSelector } from '~/hooks/use-params'
import { Badge } from '~/ui/lib/Badge'
import { FormDivider } from '~/ui/lib/Divider'
import { Message } from '~/ui/lib/Message'
import * as MiniTable from '~/ui/lib/MiniTable'
import { TextInputHint } from '~/ui/lib/TextInput'
import { KEYS } from '~/ui/util/keys'
import { ALL_ISH } from '~/util/consts'
import { validateIp, validateIpNet } from '~/util/ip'
import { links } from '~/util/links'
import { capitalize } from '~/util/str'

import { type FirewallRuleValues } from './firewall-rules-util'

/**
 * This is a large file. The main thing to be aware of is that the firewall rules
 * form is made up of two main sections: Targets and Filters. Filters, then, has
 * a few sub-sections (Ports, Protocols, and Hosts).
 *
 * The Targets section and the Filters:Hosts section are very similar, so we've
 * pulled common code to the DynamicTypeAndValueFields components.
 * We also then set up the Targets / Ports / Hosts variables at the top of the
 * CommonFields component.
 */

type TargetAndHostFilterType =
  | VpcFirewallRuleTarget['type']
  | VpcFirewallRuleHostFilter['type']

type TargetAndHostFormValues = {
  type: TargetAndHostFilterType
  value: string
  subnetVpc?: string
}

// these are part of the target and host filter form;
// the specific values depend on the target or host filter type selected
const getFilterValueProps = (targetOrHostType: TargetAndHostFilterType) => {
  switch (targetOrHostType) {
    case 'vpc':
      return { label: 'VPC name' }
    case 'subnet':
      return { label: 'Subnet name' }
    case 'instance':
      return { label: 'Instance name' }
    case 'ip':
      return { label: 'IP address', description: 'Enter an IPv4 or IPv6 address' }
    case 'ip_net':
      return {
        label: 'IP network',
        description: 'Looks like 192.168.0.0/16 or fd00:1122:3344:0001::1/64',
      }
  }
}

const DynamicTypeAndValueFields = ({
  sectionType,
  control,
  valueType,
  items,
  disabled,
  onInputChange,
  onTypeChange,
  onSubmitTextField,
}: {
  sectionType: 'target' | 'host'
  control: Control<TargetAndHostFormValues>
  valueType: TargetAndHostFilterType
  items: Array<{ value: string; label: string }>
  disabled?: boolean
  onInputChange?: (value: string) => void
  onTypeChange: () => void
  onSubmitTextField: (e: React.KeyboardEvent<HTMLInputElement>) => void
}) => {
  return (
    <>
      <ListboxField
        name="type"
        label={`${capitalize(sectionType)} type`}
        control={control}
        items={[
          { value: 'vpc', label: 'VPC' },
          { value: 'subnet', label: 'VPC subnet' },
          { value: 'instance', label: 'Instance' },
          { value: 'ip', label: 'IP' },
          { value: 'ip_net', label: 'IP subnet' },
        ]}
        onChange={onTypeChange}
        hideOptionalTag
      />
      {/* In the firewall rules form, a few types get comboboxes instead of text fields */}
      {valueType === 'vpc' || valueType === 'subnet' || valueType === 'instance' ? (
        <ComboboxField
          disabled={disabled}
          name="value"
          {...getFilterValueProps(valueType)}
          description="Select an option or enter a custom value"
          control={control}
          onInputChange={onInputChange}
          items={items}
          allowArbitraryValues
          hideOptionalTag
          validate={(value) =>
            // TODO: is required false correct here? should this function even have that argument?
            validateName(value, `${capitalize(sectionType)} name`, false)
          }
        />
      ) : (
        <TextField
          name="value"
          {...getFilterValueProps(valueType)}
          control={control}
          onKeyDown={(e) => {
            if (e.key === KEYS.enter) {
              e.preventDefault() // prevent full form submission
              onSubmitTextField(e)
            }
          }}
          validate={(value) =>
            (valueType === 'ip' && validateIp(value)) ||
            (valueType === 'ip_net' && validateIpNet(value)) ||
            undefined
          }
        />
      )}
    </>
  )
}

type TypeAndValueTableProps = {
  sectionType: 'target' | 'host'
  items: ControllerRenderProps<FirewallRuleValues, 'targets' | 'hosts'>
}
const TypeAndValueTable = ({ sectionType, items }: TypeAndValueTableProps) => (
  <MiniTable.Table
    className="mb-4"
    aria-label={sectionType === 'target' ? 'Targets' : 'Host filters'}
  >
    <MiniTable.Header>
      <MiniTable.HeadCell>Type</MiniTable.HeadCell>
      <MiniTable.HeadCell>Value</MiniTable.HeadCell>
      {/* For remove button */}
      <MiniTable.HeadCell className="w-12" />
    </MiniTable.Header>
    <MiniTable.Body>
      {items.value.map(({ type, value }, index) => (
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
          <MiniTable.RemoveCell
            onClick={() =>
              items.onChange(
                items.value.filter((i) => !(i.value === value && i.type === type))
              )
            }
            label={`remove ${sectionType} ${value}`}
          />
        </MiniTable.Row>
      ))}
    </MiniTable.Body>
  </MiniTable.Table>
)

// Given an array of committed items (VPCs, Subnets, Instances) and
// a list of all items, return the items that are available
const availableItems = (
  committedItems: Array<VpcFirewallRuleTarget | VpcFirewallRuleHostFilter>,
  itemType: 'vpc' | 'subnet' | 'instance',
  items: Array<Vpc | VpcSubnet | Instance>
) => {
  if (!items) return []
  return (
    items
      .map((item) => item.name)
      // remove any items that match the committed items on both type and value
      .filter(
        (name) =>
          !committedItems.filter((ci) => ci.type === itemType && ci.value === name).length
      )
      .map((name) => ({ label: name, value: name }))
  )
}

type ProtocolFieldProps = {
  control: Control<FirewallRuleValues>
  protocol: 'TCP' | 'UDP' | 'ICMP'
}
const ProtocolField = ({ control, protocol }: ProtocolFieldProps) => (
  <div>
    <CheckboxField name="protocols" value={protocol} control={control}>
      {protocol}
    </CheckboxField>
  </div>
)

type CommonFieldsProps = {
  control: Control<FirewallRuleValues>
  nameTaken: (name: string) => boolean
  error: ApiError | null
}

export const CommonFields = ({ control, nameTaken, error }: CommonFieldsProps) => {
  const { project, vpc } = useVpcSelector()
  const targetAndHostDefaultValues: TargetAndHostFormValues = {
    type: 'vpc',
    value: '',
    // only becomes relevant when the type is 'VPC subnet'; ignored otherwise
    subnetVpc: vpc,
  }
  // prefetchedApiQueries below are prefetched in firewall-rules-create and -edit
  const {
    data: { items: instances },
  } = usePrefetchedApiQuery('instanceList', { query: { project, limit: ALL_ISH } })
  const {
    data: { items: vpcs },
  } = usePrefetchedApiQuery('vpcList', { query: { project, limit: ALL_ISH } })
  const {
    data: { items: vpcSubnets },
  } = usePrefetchedApiQuery('vpcSubnetList', { query: { project, vpc } })

  // Targets
  const targetForm = useForm({ defaultValues: targetAndHostDefaultValues })
  const targets = useController({ name: 'targets', control }).field
  const targetType = targetForm.watch('type')
  const targetValue = targetForm.watch('value')
  // get the list of items that are not already in the list of targets
  const targetItems = {
    vpc: availableItems(targets.value, 'vpc', vpcs),
    subnet: availableItems(targets.value, 'subnet', vpcSubnets),
    instance: availableItems(targets.value, 'instance', instances),
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
    targetForm.reset(targetAndHostDefaultValues)
  })

  // Ports
  const portRangeForm = useForm({ defaultValues: { portRange: '' } })
  const ports = useController({ name: 'ports', control }).field
  const portValue = portRangeForm.watch('portRange')
  const submitPortRange = portRangeForm.handleSubmit(({ portRange }) => {
    const portRangeValue = portRange.trim()
    // at this point we've already validated in validate() that it parses and
    // that it is not already in the list
    ports.onChange([...ports.value, portRangeValue])
    portRangeForm.reset()
  })

  // Host Filters
  const hostForm = useForm({ defaultValues: targetAndHostDefaultValues })
  const hosts = useController({ name: 'hosts', control }).field
  const hostType = hostForm.watch('type')
  const hostValue = hostForm.watch('value')
  // get the list of items that are not already in the list of host filters
  const hostFilterItems = {
    vpc: availableItems(hosts.value, 'vpc', vpcs),
    subnet: availableItems(hosts.value, 'subnet', vpcSubnets),
    instance: availableItems(hosts.value, 'instance', instances),
    ip: [],
    ip_net: [],
  }
  const submitHost = hostForm.handleSubmit(({ type, value }) => {
    // ignore click if empty or a duplicate
    // TODO: show error instead of ignoring click
    if (!type || !value) return
    if (hosts.value.some((t) => t.value === value && t.type === type)) return
    hosts.onChange([...hosts.value, { type, value }])
    // TODO: something is not resetting right -- if the IP net field is set to
    // validate on change due to having an error, it stays that way after submit
    hostForm.reset(targetAndHostDefaultValues)
  })

  return (
    <>
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
          valueType={targetType}
          items={targetItems[targetType]}
          onTypeChange={() => targetForm.resetField('value')}
          onInputChange={(value) => targetForm.setValue('value', value)}
          onSubmitTextField={submitTarget}
        />
        <MiniTable.ClearAndAddButtons
          addButtonCopy="Add target"
          disableClear={!!targetValue}
          onClear={() => targetForm.reset()}
          onSubmit={submitTarget}
        />
      </div>
      {!!targets.value.length && <TypeAndValueTable sectionType="target" items={targets} />}

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
        <MiniTable.ClearAndAddButtons
          addButtonCopy="Add port filter"
          disableClear={!!portValue}
          onClear={portRangeForm.reset}
          onSubmit={submitPortRange}
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
        <ProtocolField control={control} protocol="TCP" />
        <ProtocolField control={control} protocol="UDP" />
        <ProtocolField control={control} protocol="ICMP" />
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
          valueType={hostType}
          items={hostFilterItems[hostType]}
          onTypeChange={() => targetForm.resetField('value')}
          onInputChange={(value) => hostForm.setValue('value', value)}
          onSubmitTextField={submitHost}
        />
        <MiniTable.ClearAndAddButtons
          addButtonCopy="Add host filter"
          disableClear={!!hostValue}
          onClear={() => hostForm.reset()}
          onSubmit={submitHost}
        />
      </div>
      {!!hosts.value.length && <TypeAndValueTable sectionType="host" items={hosts} />}

      {error && (
        <>
          <FormDivider />
          <div className="text-destructive">{error.message}</div>
        </>
      )}
    </>
  )
}
