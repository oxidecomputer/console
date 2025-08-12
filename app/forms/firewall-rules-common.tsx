/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useEffect } from 'react'
import {
  useFormState,
  useWatch,
  type Control,
  type UseFormReturn,
  type UseFormTrigger,
} from 'react-hook-form'

import {
  usePrefetchedApiQuery,
  type ApiError,
  type Instance,
  type Vpc,
  type VpcFirewallRuleAction,
  type VpcFirewallRuleDirection,
  type VpcFirewallRuleHostFilter,
  type VpcFirewallRuleProtocol,
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
import { TextField } from '~/components/form/fields/TextField'
import { useVpcSelector } from '~/hooks/use-params'
import { toComboboxItems } from '~/ui/lib/Combobox'
import { FormDivider } from '~/ui/lib/Divider'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import { InputMiniTable } from '~/ui/lib/InputMiniTable'
import { Message } from '~/ui/lib/Message'
import { SideModal } from '~/ui/lib/SideModal'
import { TextInput, TextInputHint } from '~/ui/lib/TextInput'
import { ALL_ISH } from '~/util/consts'
import { validateIp, validateIpNet } from '~/util/ip'
import { links } from '~/util/links'
import { ICMP_TYPES } from '~/util/protocol'
import { capitalize, normalizeDashes } from '~/util/str'

import { type FirewallRuleValues } from './firewall-rules-util'

const valuePlaceholders = {
  vpc: 'example-vpc',
  subnet: 'example-subnet',
  instance: 'example-inst',
  ip: 'IPv4 or IPv6 address',
  ip_net: 'IP network',
}

const TargetFilter = ({
  control,
  onTypeChange,
}: {
  control: Control<FirewallRuleValues>
  onTypeChange: (index: number) => void
}) => (
  <>
    <SideModal.Heading>Targets</SideModal.Heading>

    <Message
      variant="info"
      content={
        <>
          <p>
            Targets determine the instances to which this rule applies. You can target
            instances directly or specify a VPC, VPC subnet, IP, or IP subnet, which will
            apply the rule to traffic going to all matching instances.
          </p>
          <p className="mt-2">
            Targets are additive: the rule applies to instances matching{' '}
            <span className="underline">any</span> target.
          </p>
        </>
      }
    />

    <div className="flex flex-col gap-3">
      <InputMiniTable
        headers={['Type', 'Value']}
        name="targets"
        control={control}
        renderRow={(_field, index) => [
          <ListboxField
            key={`targets.${index}.type`}
            items={targetHostTypeItems}
            name={`targets.${index}.type`}
            control={control}
            onChange={() => onTypeChange(index)}
          />,
          <TargetsValueField
            key={`targets.${index}.value`}
            index={index}
            control={control}
          />,
        ]}
        emptyState={{ title: 'No targets', body: 'Add a target to see it here' }}
        defaultValue={{ type: 'vpc', value: '' }}
        columnWidths={['1.25fr', '2fr']}
      />
    </div>
  </>
)

const TargetsValueField = ({
  index,
  control,
}: {
  index: number
  control: Control<FirewallRuleValues>
}) => {
  const { project, vpc } = useVpcSelector()
  // prefetchedApiQueries below are prefetched in firewall-rules-create and -edit
  const {
    data: { items: instances },
  } = usePrefetchedApiQuery('instanceList', { query: { project, limit: ALL_ISH } })
  const {
    data: { items: vpcs },
  } = usePrefetchedApiQuery('vpcList', { query: { project, limit: ALL_ISH } })
  const {
    data: { items: vpcSubnets },
  } = usePrefetchedApiQuery('vpcSubnetList', { query: { project, vpc, limit: ALL_ISH } })

  const type = useWatch({ name: `targets.${index}.type`, control })
  const values = useWatch({ name: `targets`, control })

  const sectionItems = {
    vpc: availableItems(values, 'vpc', vpcs),
    subnet: availableItems(values, 'subnet', vpcSubnets),
    instance: availableItems(values, 'instance', instances),
    ip: [],
    ip_net: [],
  }
  const items = toComboboxItems(sectionItems[type])

  return type === 'vpc' || type === 'subnet' || type === 'instance' ? (
    <ComboboxField
      name={`targets.${index}.value`}
      label=""
      description="Select an option or enter a custom value"
      control={control}
      items={items}
      allowArbitraryValues
      hideOptionalTag
      validate={(value) =>
        // required: false arg is desirable because otherwise if you put in
        // a bad name and submit, causing it to revalidate onChange, then
        // clear the field you're left with a BS "Target name is required"
        // error message
        validateName(value, `${capitalize(type)} name`, false)
      }
      placeholder={valuePlaceholders[type]}
      popoverError
    />
  ) : (
    <TextField
      name={`targets.${index}.value`}
      control={control}
      validate={(value) =>
        (type === 'ip' && validateIp(value)) ||
        (type === 'ip_net' && validateIpNet(value)) ||
        undefined
      }
      popoverError
      placeholder={valuePlaceholders[type]}
    />
  )
}

/** Given an array of *committed* items (VPCs, Subnets, Instances) and a list of *all* items,
 *  return the items that are available */
const availableItems = (
  committedItems: Array<VpcFirewallRuleTarget | VpcFirewallRuleHostFilter>,
  itemType: 'vpc' | 'subnet' | 'instance',
  items: Array<Vpc | VpcSubnet | Instance>
) => {
  if (!items) return []
  return (
    items
      // remove any items that match the committed items on both type and value
      .filter(
        ({ name }) =>
          !committedItems.filter((ci) => ci.type === itemType && ci.value === name).length
      )
  )
}

// Protocol selection form values for the subform

const targetHostTypeItems: Array<{
  value: VpcFirewallRuleHostFilter['type']
  label: string
  selectedLabel: string
}> = [
  { value: 'vpc', label: 'VPC', selectedLabel: 'VPC' },
  { value: 'subnet', label: 'VPC subnet', selectedLabel: 'VPC subnet' },
  { value: 'instance', label: 'Instance', selectedLabel: 'Instance' },
  { value: 'ip', label: 'IP', selectedLabel: 'IP' },
  { value: 'ip_net', label: 'IP subnet', selectedLabel: 'IP subnet' },
]

const actionItems: Array<{ value: VpcFirewallRuleAction; label: string }> = [
  { value: 'allow', label: 'Allow' },
  { value: 'deny', label: 'Deny' },
]

const directionItems: Array<{ value: VpcFirewallRuleDirection; label: string }> = [
  { value: 'inbound', label: 'Inbound' },
  { value: 'outbound', label: 'Outbound' },
]

const protocolTypeItems: Array<{ value: VpcFirewallRuleProtocol['type']; label: string }> =
  [
    { value: 'tcp', label: 'TCP' },
    { value: 'udp', label: 'UDP' },
    { value: 'icmp', label: 'ICMP' },
  ]

const icmpTypeItems = [
  { value: '', label: 'All types', selectedLabel: 'All types' },
  ...Object.entries(ICMP_TYPES).map(([type, name]) => ({
    value: type,
    label: `${type} - ${name}`,
    selectedLabel: `${type}`,
  })),
]

type ParseResult<T> = { success: true; data: T } | { success: false; message: string }

const parseIcmpType = (value: string | undefined): ParseResult<number | undefined> => {
  if (value === undefined || value === '') return { success: true, data: undefined }
  const parsed = parseInt(value, 10)
  if (isNaN(parsed) || parsed < 0 || parsed > 255) {
    return { success: false, message: `ICMP type must be a number between 0 and 255` }
  }
  return { success: true, data: parsed }
}

const icmpCodeValidation = (value: string | undefined) => {
  if (!value || value.trim() === '') return undefined // allow empty

  const trimmedValue = value.trim()

  // Check if it's a single number
  if (/^\d+$/.test(trimmedValue)) {
    const num = parseInt(trimmedValue, 10)
    if (num < 0 || num > 255) {
      return 'ICMP code must be between 0 and 255'
    }
    return undefined
  }

  // Check if it's a range (e.g., "0-255", "1-10")
  if (/^\d+-\d+$/.test(trimmedValue)) {
    const [startStr, endStr] = trimmedValue.split('-')
    const start = parseInt(startStr, 10)
    const end = parseInt(endStr, 10)

    if (start < 0 || start > 255) {
      return 'ICMP code range start must be between 0 and 255'
    }
    if (end < 0 || end > 255) {
      return 'ICMP code range end must be between 0 and 255'
    }
    if (start > end) {
      return 'ICMP code range start must be less than or equal to range end'
    }

    return undefined
  }

  return 'ICMP code must be a number or numeric range'
}

const ProtocolFilters = ({
  control,
  onTypeChange,
}: {
  control: Control<FirewallRuleValues>
  onTypeChange: (index: number) => void
}) => {
  const protocols = useWatch({ name: 'protocols', control }) || []

  const renderProtocolRow = (
    _field: Record<string, unknown> & { id: string },
    index: number
  ) => {
    const selectedType = protocols?.[index]?.type

    return [
      <ListboxField
        key={`type-${index}`}
        name={`protocols.${index}.type`}
        label=""
        control={control}
        items={protocolTypeItems}
        hideOptionalTag
        onChange={() => onTypeChange(index)}
      />,
      selectedType === 'icmp' ? (
        <ComboboxField
          key={`icmp-type-${index}`}
          name={`protocols.${index}.value.icmpType`}
          label=""
          control={control}
          items={icmpTypeItems}
          allowArbitraryValues
          hideOptionalTag
          matchDropdownWidth={false}
          validate={(value) => {
            if (!value) return undefined
            const result = parseIcmpType(String(value))
            if (!result.success) return result.message
          }}
          popoverError
        />
      ) : (
        <TextInput key={`not-icmp-type-${index}`} disabled />
      ),
      selectedType === 'icmp' ? (
        <TextField
          key={`icmp-code-${index}`}
          name={`protocols.${index}.value.code`}
          control={control}
          validate={(value) => {
            if (value === null || value === undefined) return undefined
            return icmpCodeValidation(value)
          }}
          transform={normalizeDashes}
          popoverError
        />
      ) : (
        <TextInput key={`not-icmp-code-${index}`} disabled />
      ),
    ]
  }

  return (
    <div className="mt-2">
      <FieldLabel id="protocols-label">Protocol filters</FieldLabel>
      <TextInputHint id="protocols-help-text" className="mb-2">
        Choose protocol types and configure ICMP settings if needed
      </TextInputHint>
      <InputMiniTable
        headers={['Type', 'ICMP type', 'ICMP code']}
        name="protocols"
        control={control}
        renderRow={renderProtocolRow}
        emptyState={{ title: 'No protocols', body: 'Add a protocol to see it here' }}
        defaultValue={{ type: 'tcp' } as VpcFirewallRuleProtocol}
      />
    </div>
  )
}

const HostFilters = ({
  control,
  onTypeChange,
}: {
  control: Control<FirewallRuleValues>
  onTypeChange: (index: number) => void
}) => {
  const { project, vpc } = useVpcSelector()
  const {
    data: { items: instances },
  } = usePrefetchedApiQuery('instanceList', { query: { project, limit: ALL_ISH } })
  const {
    data: { items: vpcs },
  } = usePrefetchedApiQuery('vpcList', { query: { project, limit: ALL_ISH } })
  const {
    data: { items: vpcSubnets },
  } = usePrefetchedApiQuery('vpcSubnetList', { query: { project, vpc, limit: ALL_ISH } })

  const hosts = useWatch({ name: 'hosts', control }) || []

  const renderHostRow = (
    _field: Record<string, unknown> & { id: string },
    index: number
  ) => {
    const selectedType = hosts?.[index]?.type

    const sectionItems = {
      vpc: availableItems(hosts, 'vpc', vpcs),
      subnet: availableItems(hosts, 'subnet', vpcSubnets),
      instance: availableItems(hosts, 'instance', instances),
      ip: [],
      ip_net: [],
    }
    const items = toComboboxItems(sectionItems[selectedType] || [])

    return [
      <ListboxField
        key={`type-${index}`}
        name={`hosts.${index}.type`}
        label=""
        control={control}
        items={targetHostTypeItems}
        hideOptionalTag
        onChange={() => onTypeChange(index)}
      />,
      selectedType === 'vpc' || selectedType === 'subnet' || selectedType === 'instance' ? (
        <ComboboxField
          key={`value-${index}`}
          name={`hosts.${index}.value`}
          control={control}
          items={items}
          allowArbitraryValues
          hideOptionalTag
          validate={(value) => validateName(value, `Host filter name`, false)}
          popoverError
        />
      ) : (
        <TextField
          key={`value-${index}`}
          name={`hosts.${index}.value`}
          control={control}
          validate={(value) =>
            (selectedType === 'ip' && validateIp(value)) ||
            (selectedType === 'ip_net' && validateIpNet(value)) ||
            undefined
          }
          popoverError
        />
      ),
    ]
  }

  return (
    <>
      <SideModal.Heading>Host filters</SideModal.Heading>

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

      <InputMiniTable
        headers={['Host type', 'Value']}
        name="hosts"
        control={control}
        renderRow={renderHostRow}
        emptyState={{ title: 'No host filters', body: 'Add a host filter to see it here' }}
        defaultValue={{ type: 'vpc', value: '' } as VpcFirewallRuleHostFilter}
        columnWidths={['1.25fr', '2fr']}
      />
    </>
  )
}

const PortFilters = ({
  control,
  trigger,
}: {
  control: Control<FirewallRuleValues>
  trigger: UseFormTrigger<FirewallRuleValues>
}) => {
  const ports = useWatch({ name: 'ports', control })
  const { errors } = useFormState({ control })

  // Helps catch errors that span multiple fields
  // without this, errors won't be cleared on one duplicate
  // field if the other is edited
  useEffect(() => {
    if (errors['ports']) {
      trigger('ports')
    }
  }, [trigger, ports, errors])

  return (
    <div className="flex flex-col gap-3">
      <div className="mt-2">
        <FieldLabel id="ports-label">Port filters</FieldLabel>
        <TextInputHint id="ports-help-text" className="mb-2">
          A single destination port (1234) or a range (1234&ndash;2345)
        </TextInputHint>
        <InputMiniTable
          headers={['Port ranges']}
          name="ports"
          control={control}
          renderRow={(_field, index) => [
            <TextField
              key={index}
              name={`ports.${index}`}
              control={control}
              validate={(value) => {
                if (!parsePortRange(value)) return 'Not a valid port range'
                // Filter out the current port to check for duplicates
                const otherPorts = ports.filter((_, i) => i !== index)
                if (otherPorts.includes(value.trim())) return 'Port range already added'
              }}
              popoverError
            />,
          ]}
          emptyState={{ title: 'No ports', body: 'Add a port to see it here' }}
          defaultValue={new String('') as string} // if this simply '' it will not make new rows
        />
      </div>
    </div>
  )
}

type CommonFieldsProps = {
  form: UseFormReturn<FirewallRuleValues>
  nameTaken: (name: string) => boolean
  error: ApiError | null
}

export const CommonFields = ({ form, nameTaken, error }: CommonFieldsProps) => {
  const { control, trigger, setValue } = form

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
              Networking
            </a>{' '}
            guide and the{' '}
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

      <RadioField name="action" column control={control} items={actionItems} />
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
        items={directionItems}
      />
      <NumberField
        name="priority"
        description="Must be 0&ndash;65535. Lower-numbered rules apply first."
        required
        control={control}
      />

      <FormDivider />

      <TargetFilter
        control={control}
        onTypeChange={(index: number) => setValue(`targets.${index}.value`, '')}
      />

      <FormDivider />

      <SideModal.Heading>Filters</SideModal.Heading>
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

      <PortFilters control={control} trigger={trigger} />

      <ProtocolFilters
        control={control}
        onTypeChange={(index) => setValue(`protocols.${index}.value`, null)}
      />

      <FormDivider />

      <HostFilters
        control={control}
        onTypeChange={(index) => setValue(`hosts.${index}.value`, '')}
      />

      {error && (
        <>
          <FormDivider />
          <div className="text-destructive">{error.message}</div>
        </>
      )}
    </>
  )
}
