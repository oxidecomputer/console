import * as Yup from 'yup'
import { useFormikContext } from 'formik'

import {
  firewallRuleGetToPut,
  parsePortRange,
  useApiMutation,
  useApiQueryClient,
} from '@oxide/api'
import type {
  ErrorResult,
  VpcFirewallRule,
  VpcFirewallRuleUpdate,
  VpcFirewallRules,
} from '@oxide/api'
import { Button, Delete10Icon, Divider, Radio, Table } from '@oxide/ui'

import {
  CheckboxField,
  DescriptionField,
  Form,
  ListboxField,
  NameField,
  RadioField,
  SideModalForm,
  TextField,
} from 'app/components/form'
import { useRequiredParams } from 'app/hooks'

import type { CreateSideModalFormProps } from '.'

export type FirewallRuleValues = {
  enabled: boolean
  priority: string
  name: string
  description: string
  action: VpcFirewallRule['action']
  direction: VpcFirewallRule['direction']

  protocols: NonNullable<VpcFirewallRule['filters']['protocols']>

  // port subform
  ports: NonNullable<VpcFirewallRule['filters']['ports']>
  portRange: string

  // host subform
  hosts: NonNullable<VpcFirewallRule['filters']['hosts']>
  hostType: string
  hostValue: string

  // target subform
  targets: VpcFirewallRule['targets']
  targetType: string
  targetValue: string
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
  priority: parseInt(values.priority, 10),
  targets: values.targets,
})

const initialValues: FirewallRuleValues = {
  enabled: true,
  name: '',
  description: '',

  priority: '',
  action: 'allow',
  direction: 'inbound',

  // in the request body, these go in a `filters` object. we probably don't
  // need such nesting here though. not even sure how to do it
  protocols: [],

  // port subform
  ports: [],
  portRange: '',

  // host subform
  hosts: [],
  hostType: '',
  hostValue: '',

  // target subform
  targets: [],
  targetType: '',
  targetValue: '',
}

export const CommonFields = ({ error }: { error: ErrorResult | null }) => {
  const { setFieldValue, values } = useFormikContext<FirewallRuleValues>()
  return (
    <>
      {/* omitting value prop makes it a boolean value. beautiful */}
      {/* TODO: better text or heading or tip or something on this checkbox */}
      <CheckboxField name="enabled">Enabled</CheckboxField>
      <NameField id="rule-name" />
      <DescriptionField id="rule-description" />

      <Divider />

      <TextField type="number" id="priority" helpText="Must be 0&ndash;65535" />
      <RadioField id="action" label="Action" column>
        <Radio value="allow">Allow</Radio>
        <Radio value="deny">Deny</Radio>
      </RadioField>
      <RadioField id="direction" label="Direction of traffic" column>
        <Radio value="inbound">Incoming</Radio>
        <Radio value="outbound">Outgoing</Radio>
      </RadioField>

      <Divider />

      <h3 className="mb-4 text-sans-xl">Targets</h3>
      <ListboxField
        id="target-type-field"
        name="targetType"
        label="Target type"
        items={[
          { value: 'vpc', label: 'VPC' },
          { value: 'subnet', label: 'VPC Subnet' },
          { value: 'instance', label: 'Instance' },
          { value: 'ip', label: 'IP' },
          { value: 'ip_net', label: 'IP subnet' },
        ]}
      />
      {/* TODO: This is set as optional which is kind of wrong. This section represents an inlined
      subform which means it likely should be a custom field */}
      <TextField id="targetValue" name="targetValue" label="Target name" required={false} />

      <div className="flex justify-end">
        {/* TODO does this clear out the form or the existing targets? */}
        <Button variant="ghost" color="secondary" className="mr-2.5">
          Clear
        </Button>
        <Button
          variant="default"
          onClick={() => {
            // TODO: show error instead of ignoring click
            if (
              values.targetType &&
              values.targetValue && // TODO: validate
              !values.targets.some(
                (t) => t.value === values.targetValue && t.type === values.targetType
              )
            ) {
              setFieldValue('targets', [
                ...values.targets,
                { type: values.targetType, value: values.targetValue },
              ])
              setFieldValue('targetValue', '')
              // TODO: clear dropdown too?
            }
          }}
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
          {values.targets.map((t) => (
            <Table.Row key={`${t.type}|${t.value}`}>
              {/* TODO: should be the pretty type label, not the type key */}
              <Table.Cell>{t.type}</Table.Cell>
              <Table.Cell>{t.value}</Table.Cell>
              <Table.Cell>
                <Delete10Icon
                  className="cursor-pointer"
                  onClick={() => {
                    setFieldValue(
                      'targets',
                      values.targets.filter(
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

      <Divider />

      <h3 className="mb-4 text-sans-xl">Host filters</h3>
      <ListboxField
        id="host-type-field"
        name="hostType"
        label="Host type"
        items={[
          { value: 'vpc', label: 'VPC' },
          { value: 'subnet', label: 'VPC Subnet' },
          { value: 'instance', label: 'Instance' },
          { value: 'ip', label: 'IP' },
          { value: 'ip_net', label: 'IP Subnet' },
        ]}
      />
      {/* For everything but IP this is a name, but for IP it's an IP.
          So we should probably have the label on this field change when the
          host type changes. Also need to confirm that it's just an IP and
          not a block. */}
      <TextField
        id="hostValue"
        label="Value"
        helpText="For IP, an address. For the rest, a name. [TODO: copy]"
      />

      <div className="flex justify-end">
        <Button variant="ghost" color="secondary" className="mr-2.5">
          Clear
        </Button>
        <Button
          variant="default"
          onClick={() => {
            // TODO: show error instead of ignoring click
            if (
              values.hostType &&
              values.hostValue && // TODO: validate
              !values.hosts.some(
                (t) => t.value === values.hostValue || t.type === values.hostType
              )
            ) {
              setFieldValue('hosts', [
                ...values.hosts,
                { type: values.hostType, value: values.hostValue },
              ])
              setFieldValue('hostValue', '')
              // TODO: clear dropdown too?
            }
          }}
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
          {values.hosts.map((h) => (
            <Table.Row key={`${h.type}|${h.value}`}>
              {/* TODO: should be the pretty type label, not the type key */}
              <Table.Cell>{h.type}</Table.Cell>
              <Table.Cell>{h.value}</Table.Cell>
              <Table.Cell>
                <Delete10Icon
                  className="cursor-pointer"
                  onClick={() => {
                    setFieldValue(
                      'hosts',
                      values.hosts.filter(
                        (h1) => h1.value !== h.value && h1.type !== h.type
                      )
                    )
                  }}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <Divider />

      <TextField
        id="portRange"
        label="Port filter"
        helpText="A single port (1234) or a range (1234-2345)"
      />
      <div className="flex justify-end">
        <Button variant="ghost" color="secondary" className="mr-2.5">
          Clear
        </Button>
        <Button
          variant="default"
          onClick={() => {
            const portRange = values.portRange.trim()
            // TODO: show error instead of ignoring the click
            if (!parsePortRange(portRange)) return
            setFieldValue('ports', [...values.ports, portRange])
            setFieldValue('portRange', '')
          }}
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
          {values.ports.map((p) => (
            <Table.Row key={p}>
              {/* TODO: should be the pretty type label, not the type key */}
              <Table.Cell>{p}</Table.Cell>
              <Table.Cell>
                <Delete10Icon
                  className="cursor-pointer"
                  onClick={() => {
                    setFieldValue(
                      'ports',
                      values.ports.filter((p1) => p1 !== p)
                    )
                  }}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <Divider />

      <fieldset className="space-y-0.5">
        <legend>Protocols</legend>
        <div>
          <CheckboxField name="protocols" value="TCP">
            TCP
          </CheckboxField>
        </div>
        <div>
          <CheckboxField name="protocols" value="UDP">
            UDP
          </CheckboxField>
        </div>
        <div>
          <CheckboxField name="protocols" value="ICMP">
            ICMP
          </CheckboxField>
        </div>
      </fieldset>

      <Divider />

      <div className="text-destructive">{error?.error.message}</div>
    </>
  )
}

export const validationSchema = Yup.object({
  priority: Yup.number().integer().min(0).max(65535).required('Required'),
})

type CreateFirewallRuleSideModalProps = CreateSideModalFormProps<
  FirewallRuleValues,
  VpcFirewallRules
> & {
  existingRules: VpcFirewallRule[]
}

export function CreateFirewallRuleSideModalForm({
  id = 'create-firewall-rule-form',
  title = 'Add firewall rule',
  onSuccess,
  onDismiss,
  existingRules,
  ...props
}: CreateFirewallRuleSideModalProps) {
  const parentNames = useRequiredParams('orgName', 'projectName', 'vpcName')
  const queryClient = useApiQueryClient()

  const updateRules = useApiMutation('vpcFirewallRulesUpdate', {
    onSuccess(data) {
      queryClient.invalidateQueries('vpcFirewallRulesView', { path: parentNames })
      onSuccess?.(data)
      onDismiss()
    },
  })

  return (
    <SideModalForm
      id={id}
      title={title}
      initialValues={initialValues}
      onDismiss={onDismiss}
      onSubmit={(values) => {
        // TODO: this silently overwrites existing rules with the current name.
        // we should probably at least warn and confirm, if not reject as invalid
        const otherRules = existingRules
          .filter((r) => r.name !== values.name)
          .map(firewallRuleGetToPut)
        updateRules.mutate({
          path: parentNames,
          body: {
            rules: [...otherRules, valuesToRuleUpdate(values)],
          },
        })
      }}
      validationSchema={validationSchema}
      validateOnBlur
      submitDisabled={updateRules.isLoading}
      error={updateRules.error?.error as Error | undefined}
      {...props}
    >
      <CommonFields error={updateRules.error} />
      <Form.Submit>Add rule</Form.Submit>
    </SideModalForm>
  )
}
