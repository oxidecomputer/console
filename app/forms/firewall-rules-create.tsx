import type { Control } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useController } from 'react-hook-form'

import {
  firewallRuleGetToPut,
  parsePortRange,
  useApiMutation,
  useApiQueryClient,
} from '@oxide/api'
import type {
  ApiError,
  VpcFirewallRule,
  VpcFirewallRuleHostFilter,
  VpcFirewallRuleTarget,
  VpcFirewallRuleUpdate,
} from '@oxide/api'
import { Button, Close12Icon, FormDivider, Table } from '@oxide/ui'

import {
  CheckboxField,
  DescriptionField,
  ListboxField,
  NameField,
  RadioField,
  SideModalForm,
  TextField,
} from 'app/components/form'
import { useVpcSelector } from 'app/hooks'

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

export const CommonFields = ({ error, control }: CommonFieldsProps) => {
  const portRangeForm = useForm({ defaultValues: portRangeDefaultValues })
  const ports = useController({ name: 'ports', control }).field

  const hostForm = useForm({ defaultValues: hostDefaultValues })
  const hosts = useController({ name: 'hosts', control }).field

  const targetForm = useForm({ defaultValues: targetDefaultValues })
  const targets = useController({ name: 'targets', control }).field
  return (
    <>
      {/* omitting value prop makes it a boolean value. beautiful */}
      {/* TODO: better text or heading or tip or something on this checkbox */}
      <CheckboxField name="enabled" control={control}>
        Enabled
      </CheckboxField>
      <NameField name="name" control={control} />
      <DescriptionField name="description" control={control} />

      <FormDivider />

      <TextField
        type="number"
        name="priority"
        helpText="Must be 0&ndash;65535"
        required
        control={control}
      />
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
          { value: 'inbound', label: 'Incoming' },
          { value: 'outbound', label: 'Outgoing' },
        ]}
      />

      <FormDivider />

      {/* Really this should be its own <form>, but you can't have a form inside a form,
          so we just stick the submit handler in a button onClick */}
      <h3 className="mb-4 text-sans-xl">Targets</h3>
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
      <TextField
        name="value"
        {...getFilterValueProps(targetForm.watch('type'))}
        required
        control={targetForm.control}
      />

      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2.5"
          onClick={() => targetForm.reset()}
        >
          Clear
        </Button>
        <Button
          size="sm"
          onClick={targetForm.handleSubmit(({ type, value }) => {
            // TODO: show error instead of ignoring click
            // TODO: do this with a normal validation
            if (
              type &&
              value &&
              !targets.value.some((t) => t.value === value && t.type === type)
            ) {
              targets.onChange([...targets.value, { type, value }])
              targetForm.reset()
            }
          })}
        >
          Add target
        </Button>
      </div>

      <Table className="w-full">
        <Table.Header>
          <Table.HeaderRow>
            <Table.HeadCell>Type</Table.HeadCell>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell />
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          {targets.value.map((t) => (
            <Table.Row key={`${t.type}|${t.value}`}>
              {/* TODO: should be the pretty type label, not the type key */}
              <Table.Cell>{t.type}</Table.Cell>
              <Table.Cell>{t.value}</Table.Cell>
              <Table.Cell>
                <Close12Icon
                  className="cursor-pointer"
                  onClick={() => {
                    targets.onChange(
                      targets.value.filter(
                        (t1) => t1.value !== t.value || t1.type !== t.type
                      )
                    )
                  }}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <FormDivider />

      <h3 className="mb-4 text-sans-xl">Host filters</h3>
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
      />

      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2.5"
          onClick={() => hostForm.reset()}
        >
          Clear
        </Button>
        <Button
          size="sm"
          onClick={hostForm.handleSubmit(({ type, value }) => {
            // TODO: show error instead of ignoring click
            if (
              type &&
              value &&
              !hosts.value.some((t) => t.value === value || t.type === type)
            ) {
              hosts.onChange([...hosts.value, { type, value }])
              hostForm.reset()
            }
          })}
        >
          Add host filter
        </Button>
      </div>

      <Table className="w-full">
        <Table.Header>
          <Table.HeaderRow>
            <Table.HeadCell>Type</Table.HeadCell>
            <Table.HeadCell>Value</Table.HeadCell>
            <Table.HeadCell />
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          {hosts.value.map((h) => (
            <Table.Row key={`${h.type}|${h.value}`}>
              {/* TODO: should be the pretty type label, not the type key */}
              <Table.Cell>{h.type}</Table.Cell>
              <Table.Cell>{h.value}</Table.Cell>
              <Table.Cell>
                <Close12Icon
                  className="cursor-pointer"
                  onClick={() => {
                    hosts.onChange(
                      hosts.value.filter((h1) => h1.value !== h.value && h1.type !== h.type)
                    )
                  }}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <FormDivider />

      <TextField
        name="portRange"
        label="Port filter"
        helpText="A single port (1234) or a range (1234-2345)"
        required
        control={portRangeForm.control}
      />
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2.5"
          onClick={() => portRangeForm.reset()}
        >
          Clear
        </Button>
        <Button
          size="sm"
          onClick={portRangeForm.handleSubmit(({ portRange }) => {
            const portRangeValue = portRange.trim()
            // TODO: show error instead of ignoring the click
            if (!parsePortRange(portRangeValue)) return
            ports.onChange([...ports.value, portRangeValue])
            portRangeForm.reset()
          })}
        >
          Add port filter
        </Button>
      </div>
      <Table className="w-full">
        <Table.Header>
          <Table.HeaderRow>
            <Table.HeadCell>Range</Table.HeadCell>
            <Table.HeadCell />
          </Table.HeaderRow>
        </Table.Header>
        <Table.Body>
          {ports.value.map((p) => (
            <Table.Row key={p}>
              {/* TODO: should be the pretty type label, not the type key */}
              <Table.Cell>{p}</Table.Cell>
              <Table.Cell>
                <Close12Icon
                  className="cursor-pointer"
                  onClick={() => {
                    ports.onChange(ports.value.filter((p1) => p1 !== p))
                  }}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <FormDivider />

      <fieldset className="space-y-0.5">
        <legend>Protocols</legend>
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
      queryClient.invalidateQueries('vpcFirewallRulesView', { query: vpcSelector })
      onDismiss()
    },
  })

  const form = useForm({ mode: 'all', defaultValues })

  return (
    <SideModalForm
      id="create-firewall-rule-form"
      title="Add firewall rule"
      form={form}
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
      loading={updateRules.isLoading}
      submitError={updateRules.error}
      submitLabel="Add rule"
    >
      <CommonFields error={updateRules.error} control={form.control} />
    </SideModalForm>
  )
}
