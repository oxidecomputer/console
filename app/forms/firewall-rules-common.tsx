/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useEffect, type ReactNode } from 'react'
import { useController, useForm, type Control } from 'react-hook-form'

import {
  usePrefetchedApiQuery,
  type ApiError,
  type Instance,
  type Vpc,
  type VpcFirewallIcmpFilter,
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
import { TextField, TextFieldInner } from '~/components/form/fields/TextField'
import { useVpcSelector } from '~/hooks/use-params'
import {
  ProtocolCell,
  ProtocolCodeCell,
  ProtocolTypeCell,
} from '~/table/cells/ProtocolCell'
import { Badge } from '~/ui/lib/Badge'
import { toComboboxItems } from '~/ui/lib/Combobox'
import { FormDivider } from '~/ui/lib/Divider'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import { Message } from '~/ui/lib/Message'
import { ClearAndAddButtons, MiniTable } from '~/ui/lib/MiniTable'
import { SideModal } from '~/ui/lib/SideModal'
import { TextInputHint } from '~/ui/lib/TextInput'
import { KEYS } from '~/ui/util/keys'
import { ALL_ISH } from '~/util/consts'
import { validateIp, validateIpNet } from '~/util/ip'
import { links } from '~/util/links'
import { getProtocolDisplayName, getProtocolKey, ICMP_TYPES } from '~/util/protocol'
import { capitalize, normalizeDashes } from '~/util/str'

import { type FirewallRuleValues } from './firewall-rules-util'

/**
 * This is a large file. The main thing to be aware of is that the firewall rules
 * form is made up of two main sections: Targets and Filters. Filters, then, has
 * a few sub-sections (Ports, Protocols, and Hosts).
 *
 * The Targets section and the Filters:Hosts section are very similar, so we've
 * pulled common code to the TargetAndHostFilterSubform components.
 * We also then set up the Targets / Ports / Hosts variables at the top of the
 * CommonFields component.
 */

type TargetAndHostFilterType =
  | VpcFirewallRuleTarget['type']
  | VpcFirewallRuleHostFilter['type']

type TargetAndHostFormValues = {
  type: TargetAndHostFilterType
  value: string
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

const TargetAndHostFilterSubform = ({
  sectionType,
  control,
  messageContent,
}: {
  sectionType: 'target' | 'host'
  control: Control<FirewallRuleValues>
  messageContent: ReactNode
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

  const subform = useForm({ defaultValues: targetAndHostDefaultValues })
  const field = useController({ name: `${sectionType}s`, control }).field

  const submitSubform = subform.handleSubmit(({ type, value }) => {
    if (!type || !value) return
    if (field.value.some((f) => f.type === type && f.value === value)) return
    field.onChange([...field.value, { type, value }])
    subform.reset(targetAndHostDefaultValues)
  })

  // HACK: we need to reset the target form completely after a successful submit,
  // including especially `isSubmitted`, because that governs whether we're in
  // the validate regime (which doesn't validate until submit) or the reValidate
  // regime (which validate on every keypress). The reset inside `handleSubmit`
  // doesn't do that for us because `handleSubmit` set `isSubmitted: true` after
  // running the callback. So we have to watch for a successful submit and call
  // the reset again here.
  // https://github.com/react-hook-form/react-hook-form/blob/9a497a70a/src/logic/createFormControl.ts#L1194-L1203
  const { isSubmitSuccessful: subformSubmitSuccessful } = subform.formState
  useEffect(() => {
    if (subformSubmitSuccessful) subform.reset(targetAndHostDefaultValues)
  }, [subformSubmitSuccessful, subform])

  const [valueType, value] = subform.watch(['type', 'value'])
  const sectionItems = {
    vpc: availableItems(field.value, 'vpc', vpcs),
    subnet: availableItems(field.value, 'subnet', vpcSubnets),
    instance: availableItems(field.value, 'instance', instances),
    ip: [],
    ip_net: [],
  }
  const items = toComboboxItems(sectionItems[valueType])
  const subformControl = subform.control
  // HACK: reset the whole subform, keeping type (because we just set
  // it). most importantly, this resets isSubmitted so the form can go
  // back to validating on submit instead of change. Also resets readyToSubmit.
  const onTypeChange = () => {
    subform.reset({ type: subform.getValues('type'), value: '' })
  }
  const onInputChange = (value: string) => {
    subform.setValue('value', value)
  }

  const noun = sectionType === 'target' ? 'target' : 'host filter'
  const nounTitle = capitalize(noun) + 's'

  return (
    <>
      <SideModal.Heading>{nounTitle}</SideModal.Heading>

      <Message variant="info" content={messageContent} />
      <ListboxField
        name="type"
        label={`${capitalize(sectionType)} type`}
        control={subformControl}
        items={targetHostTypeItems}
        onChange={onTypeChange}
        hideOptionalTag
      />
      {/* In the firewall rules form, a few types get comboboxes instead of text fields */}
      {valueType === 'vpc' || valueType === 'subnet' || valueType === 'instance' ? (
        <ComboboxField
          disabled={subform.formState.isSubmitting}
          name="value"
          {...getFilterValueProps(valueType)}
          description="Select an option or enter a custom value"
          control={subformControl}
          onEnter={submitSubform}
          onInputChange={onInputChange}
          items={items}
          allowArbitraryValues
          hideOptionalTag
          validate={(value) =>
            // required: false arg is desirable because otherwise if you put in
            // a bad name and submit, causing it to revalidate onChange, then
            // clear the field you're left with a BS "Target name is required"
            // error message
            validateName(value, `${capitalize(sectionType)} name`, false)
          }
        />
      ) : (
        <TextField
          name="value"
          {...getFilterValueProps(valueType)}
          control={subformControl}
          disabled={subform.formState.isSubmitting}
          onKeyDown={(e) => {
            if (e.key === KEYS.enter) {
              e.preventDefault() // prevent full form submission
              submitSubform(e)
            }
          }}
          validate={(value) =>
            (valueType === 'ip' && validateIp(value)) ||
            (valueType === 'ip_net' && validateIpNet(value)) ||
            undefined
          }
        />
      )}
      <ClearAndAddButtons
        addButtonCopy={`Add ${noun}`}
        disabled={!value}
        onClear={() => subform.reset()}
        onSubmit={submitSubform}
      />
      <MiniTable
        className="mb-4"
        ariaLabel={nounTitle}
        items={field.value}
        columns={targetAndHostTableColumns}
        rowKey={({ type, value }: VpcFirewallRuleTarget | VpcFirewallRuleHostFilter) =>
          `${type}|${value}`
        }
        onRemoveItem={({
          type,
          value,
        }: VpcFirewallRuleTarget | VpcFirewallRuleHostFilter) => {
          field.onChange(field.value.filter((i) => !(i.value === value && i.type === type)))
        }}
      />
    </>
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
type ProtocolFormValues = {
  protocolType: VpcFirewallRuleProtocol['type'] | ''
  icmpType?: string // ComboboxField with allowArbitraryValues can return strings
  icmpCode?: string
}

const targetHostTypeItems: Array<{
  value: VpcFirewallRuleHostFilter['type']
  label: string
}> = [
  { value: 'vpc', label: 'VPC' },
  { value: 'subnet', label: 'VPC subnet' },
  { value: 'instance', label: 'Instance' },
  { value: 'ip', label: 'IP' },
  { value: 'ip_net', label: 'IP subnet' },
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

const targetAndHostTableColumns = [
  {
    header: 'Type',
    cell: (item: VpcFirewallRuleTarget | VpcFirewallRuleHostFilter) => (
      <Badge>{item.type}</Badge>
    ),
  },
  {
    header: 'Value',
    cell: (item: VpcFirewallRuleTarget | VpcFirewallRuleHostFilter) => item.value,
  },
]

const portTableColumns = [{ header: 'Port ranges', cell: (p: string) => p }]

const protocolTableColumns = [
  {
    header: 'Protocol',
    cell: (protocol: VpcFirewallRuleProtocol) => <ProtocolCell protocol={protocol} />,
  },
  {
    header: 'Type',
    cell: (protocol: VpcFirewallRuleProtocol) => <ProtocolTypeCell protocol={protocol} />,
  },
  {
    header: 'Code',
    cell: (protocol: VpcFirewallRuleProtocol) => <ProtocolCodeCell protocol={protocol} />,
  },
]

const isDuplicateProtocol = (
  newProtocol: VpcFirewallRuleProtocol,
  existingProtocols: VpcFirewallRuleProtocol[]
) => {
  if (newProtocol.type === 'tcp' || newProtocol.type === 'udp') {
    return existingProtocols.some((p) => p.type === newProtocol.type)
  }

  if (newProtocol.type === 'icmp') {
    if (newProtocol.value === null) {
      return existingProtocols.some((p) => p.type === 'icmp' && p.value === null)
    }
    return existingProtocols.some(
      (p) =>
        p.type === 'icmp' &&
        p.value?.icmpType === newProtocol.value?.icmpType &&
        p.value?.code === newProtocol.value?.code
    )
  }

  return false
}

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

const ProtocolFilters = ({ control }: { control: Control<FirewallRuleValues> }) => {
  const protocols = useController({ name: 'protocols', control }).field
  const protocolForm = useForm<ProtocolFormValues>({
    defaultValues: { protocolType: '' },
  })

  const selectedProtocolType = protocolForm.watch('protocolType')
  const selectedIcmpType = protocolForm.watch('icmpType')

  const addProtocolIfUnique = (newProtocol: VpcFirewallRuleProtocol) => {
    if (!isDuplicateProtocol(newProtocol, protocols.value)) {
      protocols.onChange([...protocols.value, newProtocol])
    }
  }

  const submitProtocol = protocolForm.handleSubmit((values) => {
    if (values.protocolType === 'tcp' || values.protocolType === 'udp') {
      addProtocolIfUnique({ type: values.protocolType })
    } else if (values.protocolType === 'icmp') {
      // this parse should never fail because we've already validated, but doing
      // it this way keeps the just-in-case early return logic consistent
      const parseResult = parseIcmpType(values.icmpType)
      if (!parseResult.success) return

      const icmpType = parseResult.data
      if (icmpType === undefined) {
        // All ICMP types
        addProtocolIfUnique({ type: 'icmp', value: null })
      } else {
        // Specific ICMP type
        const icmpValue: VpcFirewallIcmpFilter = { icmpType }
        if (values.icmpCode) {
          icmpValue.code = values.icmpCode
        }
        addProtocolIfUnique({ type: 'icmp', value: icmpValue })
      }
    }
    protocolForm.reset()
  })

  const removeProtocol = (protocolToRemove: VpcFirewallRuleProtocol) => {
    const newProtocols = protocols.value.filter((protocol) => protocol !== protocolToRemove)
    protocols.onChange(newProtocols)
  }

  return (
    <>
      <div className="space-y-3">
        <div className="space-y-5">
          <ListboxField
            name="protocolType"
            label="Protocol filters"
            hideOptionalTag
            control={protocolForm.control}
            placeholder=""
            items={protocolTypeItems}
          />

          {selectedProtocolType === 'icmp' && (
            <>
              <ComboboxField
                label="ICMP type"
                name="icmpType"
                control={protocolForm.control}
                description="Leave blank to match any type"
                placeholder=""
                allowArbitraryValues
                onInputChange={(value) => protocolForm.setValue('icmpType', value)}
                items={icmpTypeItems}
                validate={(value) => {
                  const result = parseIcmpType(value)
                  if (!result.success) return result.message
                }}
              />

              {selectedIcmpType !== undefined && selectedIcmpType !== '' && (
                <TextField
                  label="ICMP code"
                  name="icmpCode"
                  control={protocolForm.control}
                  description={
                    <>
                      Enter a code (0) or range (e.g. 1&ndash;3). Leave blank for all
                      traffic of type {selectedIcmpType}.
                    </>
                  }
                  placeholder=""
                  validate={icmpCodeValidation}
                  transform={normalizeDashes}
                />
              )}
            </>
          )}
        </div>

        <ClearAndAddButtons
          addButtonCopy="Add protocol filter"
          disabled={!selectedProtocolType}
          onClear={() => protocolForm.reset()}
          onSubmit={submitProtocol}
        />
      </div>

      {protocols.value.length > 0 && (
        <MiniTable
          ariaLabel="Protocol filters"
          items={protocols.value}
          columns={protocolTableColumns}
          rowKey={getProtocolKey}
          emptyState={{ title: 'No protocols', body: 'Add a protocol to see it here' }}
          onRemoveItem={removeProtocol}
          removeLabel={(protocol) => `Remove ${getProtocolDisplayName(protocol)}`}
        />
      )}
    </>
  )
}

type CommonFieldsProps = {
  control: Control<FirewallRuleValues>
  nameTaken: (name: string) => boolean
  error: ApiError | null
}

const targetAndHostDefaultValues: TargetAndHostFormValues = {
  type: 'vpc',
  value: '',
}

export const CommonFields = ({ control, nameTaken, error }: CommonFieldsProps) => {
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

      <TargetAndHostFilterSubform
        sectionType="target"
        control={control}
        messageContent={
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

      <div className="flex flex-col gap-3">
        {/* We have to blow this up instead of using TextField to get better
            text styling on the label */}
        <div className="mt-2">
          <FieldLabel id="portRange-label" htmlFor="portRange">
            Port filters
          </FieldLabel>
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
          addButtonCopy="Add port filter"
          disabled={!portValue}
          onClear={() => portRangeForm.reset()}
          onSubmit={submitPortRange}
        />
      </div>
      {ports.value.length > 0 && (
        <MiniTable
          className="mb-4"
          ariaLabel="Port filters"
          items={ports.value}
          columns={portTableColumns}
          rowKey={(port) => port}
          emptyState={{ title: 'No ports', body: 'Add a port to see it here' }}
          onRemoveItem={(p) => ports.onChange(ports.value.filter((p1) => p1 !== p))}
          removeLabel={(port) => `remove port ${port}`}
        />
      )}

      <ProtocolFilters control={control} />

      <FormDivider />

      <TargetAndHostFilterSubform
        sectionType="host"
        control={control}
        messageContent={
          <>
            Host filters match the &ldquo;other end&rdquo; of traffic from the
            target&rsquo;s perspective: for an inbound rule, they match the source of
            traffic. For an outbound rule, they match the destination.
          </>
        }
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
