/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useController, type Control } from 'react-hook-form'

import {
  firewallRuleGetToPut,
  parsePortRange,
  useApiMutation,
  useApiQueryClient,
  type ApiError,
  type VpcFirewallRule,
  type VpcFirewallRuleHostFilter,
  type VpcFirewallRuleTarget,
  type VpcFirewallRuleUpdate,
} from '@oxide/api'
import { Error16Icon } from '@oxide/design-system/icons/react'

import { CheckboxField } from '~/components/form/fields/CheckboxField'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { NumberField } from '~/components/form/fields/NumberField'
import { RadioField } from '~/components/form/fields/RadioField'
import { TextField, TextFieldInner } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { useForm, useVpcSelector } from '~/hooks'
import { Badge } from '~/ui/lib/Badge'
import { Button } from '~/ui/lib/Button'
import { FormDivider } from '~/ui/lib/Divider'
import { Message } from '~/ui/lib/Message'
import * as MiniTable from '~/ui/lib/MiniTable'
import { TextInputHint } from '~/ui/lib/TextInput'
import { KEYS } from '~/ui/util/keys'

export type FirewallRuleValues = {
  enabled: boolean
  priority: number
  name: string
  description: string
  action: VpcFirewallRule['action']
  direction: VpcFirewallRule['direction']

  protocols: NonNullable<VpcFirewallRule['filters']['protocols']>

  ports: NonNullable<VpcFirewallRule['filters']['ports']>
  hosts: NonNullable<VpcFirewallRule['filters']['hosts']>
  targets: VpcFirewallRuleTarget[]
}

export const valuesToRuleUpdate = (values: FirewallRuleValues): VpcFirewallRuleUpdate => ({
  name: values.name,
  status: values.enabled ? 'enabled' : 'disabled',
  action: values.action,
  description: values.description,
  direction: values.direction,
  filters: {
    hosts: values.hosts,
    ports: values.ports,
    protocols: values.protocols,
  },
  priority: values.priority,
  targets: values.targets,
})

const defaultValues: FirewallRuleValues = {
  enabled: true,
  name: '',
  description: '',

  priority: 0,
  action: 'allow',
  direction: 'inbound',

  // in the request body, these go in a `filters` object. we probably don't
  // need such nesting here though. not even sure how to do it
  protocols: [],

  ports: [],
  hosts: [],
  targets: [],
}

type PortRangeFormValues = {
  portRange: string
}

const portRangeDefaultValues: PortRangeFormValues = {
  portRange: '',
}

type HostFormValues = {
  type: VpcFirewallRuleHostFilter['type']
  value: string
}

const hostDefaultValues: HostFormValues = {
  type: 'vpc',
  value: '',
}

type TargetFormValues = {
  type: VpcFirewallRuleTarget['type']
  value: string
}

const targetDefaultValues: TargetFormValues = {
  type: 'vpc',
  value: '',
}

type CommonFieldsProps = {
  error: ApiError | null
  control: Control<FirewallRuleValues>
}

function getFilterValueProps(hostType: VpcFirewallRuleHostFilter['type']) {
  switch (hostType) {
    case 'vpc':
      return { label: 'VPC name' }
    case 'subnet':
      return { label: 'Subnet name' }
    case 'instance':
      return { label: 'Instance name' }
    case 'ip':
      return { label: 'IP address', helpText: 'An IPv4 or IPv6 address' }
    case 'ip_net':
      return {
        label: 'IP network',
        helpText: 'Looks like 192.168.0.0/16 or fd00:1122:3344:0001::1/64',
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
          href="https://docs.oxide.computer/guides/configuring-guest-networking#_firewall_rules"
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

export const CommonFields = ({ error, control }: CommonFieldsProps) => {
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
  const submitTarget = targetForm.handleSubmit(({ type, value }) => {
    // TODO: do this with a normal validation
    // ignore click if empty or a duplicate
    // TODO: show error instead of ignoring click
    if (!type || !value) return
    if (targets.value.some((t) => t.value === value && t.type === type)) return

    targets.onChange([...targets.value, { type, value }])
    targetForm.reset()
  })

  return (
    <>
      <DocsLinkMessage />
      {/* omitting value prop makes it a boolean value. beautiful */}
      {/* TODO: better text or heading or tip or something on this checkbox */}
      <CheckboxField name="enabled" control={control}>
        Enabled
      </CheckboxField>
      <NameField name="name" control={control} />
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
      <h3 className="mb-4 text-sans-2xl">Targets</h3>
      <Message
        variant="info"
        content="Targets determine the instances to which this rule applies. You can target instances directly or specify a VPC, VPC subnet, IP, or IP subnet which will apply the rule to all matching instances. Targets are additive: the rule applies to instances matching any target."
      />
      {/* TODO: make ListboxField smarter with the values like RadioField is */}
      <ListboxField
        name="type"
        label="Target type"
        items={[
          { value: 'vpc', label: 'VPC' },
          { value: 'subnet', label: 'VPC Subnet' },
          { value: 'instance', label: 'Instance' },
          { value: 'ip', label: 'IP' },
          { value: 'ip_net', label: 'IP subnet' },
        ]}
        required
        control={targetForm.control}
      />

      <div className="flex flex-col gap-3">
        <TextField
          name="value"
          {...getFilterValueProps(targetForm.watch('type'))}
          required
          control={targetForm.control}
          onKeyDown={(e) => {
            if (e.key === KEYS.enter) {
              e.preventDefault() // prevent full form submission
              submitTarget(e)
            }
          }}
          // TODO: validate here, but it's complicated because it's conditional
          // on which type is selected
        />

        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2.5"
            disabled={!targetForm.formState.isDirty}
            onClick={() => targetForm.reset()}
          >
            Clear
          </Button>
          <Button size="sm" onClick={submitTarget}>
            Add target
          </Button>
        </div>
      </div>

      {!!targets.value.length && (
        <MiniTable.Table className="mb-4" aria-label="Targets">
          <MiniTable.Header>
            <MiniTable.HeadCell>Type</MiniTable.HeadCell>
            <MiniTable.HeadCell>Value</MiniTable.HeadCell>
            {/* For remove button */}
            <MiniTable.HeadCell className="w-12" />
          </MiniTable.Header>
          <MiniTable.Body>
            {targets.value.map((t, index) => (
              <MiniTable.Row
                tabIndex={0}
                aria-rowindex={index + 1}
                aria-label={`Name: ${t.value}, Type: ${t.type}`}
                key={`${t.type}|${t.value}`}
              >
                <MiniTable.Cell>
                  <Badge variant="solid">{t.type}</Badge>
                </MiniTable.Cell>
                <MiniTable.Cell>{t.value}</MiniTable.Cell>
                <MiniTable.Cell>
                  <button
                    onClick={() =>
                      targets.onChange(
                        targets.value.filter(
                          (i) => !(i.value === t.value && i.type === t.type)
                        )
                      )
                    }
                  >
                    <Error16Icon title={`remove ${t.value}`} />
                  </button>
                </MiniTable.Cell>
              </MiniTable.Row>
            ))}
          </MiniTable.Body>
        </MiniTable.Table>
      )}

      <FormDivider />

      <h3 className="mb-4 text-sans-2xl">Filters</h3>

      <Message
        variant="info"
        content="Filters reduce the scope of this rule. Without filters, the rule applies to all traffic to the targets (or from the targets, if it's an outbound rule). With multiple filters, it applies to traffic matching all filters."
      />

      <div className="flex flex-col gap-3">
        {/* We have to blow this up instead of using TextField to get better 
            text styling on the label */}
        <div className="mt-2">
          <label id="portRange-label" htmlFor="portRange" className="text-sans-lg">
            Port filters
          </label>
          <TextInputHint id="portRange-help-text" className="mb-2">
            A single port (1234) or a range (1234&ndash;2345)
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
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2.5"
            disabled={!portRangeForm.formState.isDirty}
            onClick={() => portRangeForm.reset()}
          >
            Clear
          </Button>
          <Button size="sm" onClick={submitPortRange}>
            Add port filter
          </Button>
        </div>
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
                <MiniTable.Cell>
                  <button
                    onClick={() => ports.onChange(ports.value.filter((p1) => p1 !== p))}
                  >
                    <Error16Icon title={`remove ${p}`} />
                  </button>
                </MiniTable.Cell>
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
        <ListboxField
          name="type"
          label="Host type"
          items={[
            { value: 'vpc', label: 'VPC' },
            { value: 'subnet', label: 'VPC Subnet' },
            { value: 'instance', label: 'Instance' },
            { value: 'ip', label: 'IP' },
            { value: 'ip_net', label: 'IP Subnet' },
          ]}
          required
          control={hostForm.control}
        />

        {/* For everything but IP this is a name, but for IP it's an IP.
          So we should probably have the label on this field change when the
          host type changes. Also need to confirm that it's just an IP and
          not a block. */}
        <TextField
          name="value"
          {...getFilterValueProps(hostForm.watch('type'))}
          required
          control={hostForm.control}
          onKeyDown={(e) => {
            if (e.key === KEYS.enter) {
              e.preventDefault() // prevent full form submission
              submitHost(e)
            }
          }}
          // TODO: validate here, but it's complicated because it's conditional
          // on which type is selected
        />

        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2.5"
            disabled={!hostForm.formState.isDirty}
            onClick={() => hostForm.reset()}
          >
            Clear
          </Button>
          <Button size="sm" onClick={submitHost}>
            Add host filter
          </Button>
        </div>

        {!!hosts.value.length && (
          <MiniTable.Table className="mb-4" aria-label="Host filters">
            <MiniTable.Header>
              <MiniTable.HeadCell>Type</MiniTable.HeadCell>
              <MiniTable.HeadCell>Value</MiniTable.HeadCell>
              {/* For remove button */}
              <MiniTable.HeadCell className="w-12" />
            </MiniTable.Header>
            <MiniTable.Body>
              {hosts.value.map((h, index) => (
                <MiniTable.Row
                  tabIndex={0}
                  aria-rowindex={index + 1}
                  aria-label={`Name: ${h.value}, Type: ${h.type}`}
                  key={`${h.type}|${h.value}`}
                >
                  <MiniTable.Cell>
                    <Badge variant="solid">{h.type}</Badge>
                  </MiniTable.Cell>
                  <MiniTable.Cell>{h.value}</MiniTable.Cell>
                  <MiniTable.Cell>
                    <button
                      onClick={() =>
                        hosts.onChange(
                          hosts.value.filter(
                            (i) => !(i.value === h.value && i.type === h.type)
                          )
                        )
                      }
                    >
                      <Error16Icon title={`remove ${h.value}`} />
                    </button>
                  </MiniTable.Cell>
                </MiniTable.Row>
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

// TODO: validate priority again
// export const validationSchema = Yup.object({
//   priority: Yup.number().integer().min(0).max(65535).required('Required'),
// })

type CreateFirewallRuleFormProps = {
  onDismiss: () => void
  existingRules: VpcFirewallRule[]
}

export function CreateFirewallRuleForm({
  onDismiss,
  existingRules,
}: CreateFirewallRuleFormProps) {
  const vpcSelector = useVpcSelector()
  const queryClient = useApiQueryClient()

  const updateRules = useApiMutation('vpcFirewallRulesUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcFirewallRulesView')
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="rule"
      title="Add firewall rule"
      onDismiss={onDismiss}
      onSubmit={(values) => {
        // TODO: this silently overwrites existing rules with the current name.
        // we should probably at least warn and confirm, if not reject as invalid
        const otherRules = existingRules
          .filter((r) => r.name !== values.name)
          .map(firewallRuleGetToPut)
        updateRules.mutate({
          query: vpcSelector,
          body: {
            rules: [...otherRules, valuesToRuleUpdate(values)],
          },
        })
      }}
      loading={updateRules.isPending}
      submitError={updateRules.error}
      submitLabel="Add rule"
    >
      <CommonFields error={updateRules.error} control={form.control} />
    </SideModalForm>
  )
}
