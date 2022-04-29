import { useFormikContext } from 'formik'
import * as Yup from 'yup'

import { Form } from 'app/components/form'
import type { VpcFirewallRules } from '@oxide/api'
import {
  firewallRuleGetToPut,
  parsePortRange,
  useApiMutation,
  useApiQueryClient,
} from '@oxide/api'
import {
  Button,
  CheckboxField,
  Delete10Icon,
  Divider,
  Dropdown,
  FieldLabel,
  NumberTextField,
  Radio,
  RadioGroup,
  Table,
  TextField,
  TextFieldError,
  TextFieldHint,
} from '@oxide/ui'
import type { PrebuiltFormProps } from 'app/forms'
import type { ErrorResponse, VpcFirewallRule, VpcFirewallRuleUpdate } from '@oxide/api'
import { useParams } from 'app/hooks'

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

export const CommonFields = ({ error }: { error: ErrorResponse | null }) => {
  const { setFieldValue, values } = useFormikContext<FirewallRuleValues>()
  return (
    <>
      {/* omitting value prop makes it a boolean value. beautiful */}
      {/* TODO: better text or heading or tip or something on this checkbox */}
      <CheckboxField name="enabled">Enabled</CheckboxField>
      <div className="space-y-0.5">
        <FieldLabel id="rule-name-label" htmlFor="rule-name">
          Name
        </FieldLabel>
        <TextField id="rule-name" name="name" />
      </div>
      <div className="space-y-0.5">
        <FieldLabel id="rule-description-label" htmlFor="rule-description">
          Description {/* TODO: indicate optional */}
        </FieldLabel>
        <TextField id="rule-description" name="description" />
      </div>

      <Divider />

      <div className="space-y-0.5">
        <FieldLabel id="priority-label" htmlFor="priority">
          Priority
        </FieldLabel>
        <TextFieldHint id="priority-hint">Must be 0&ndash;65535</TextFieldHint>
        <NumberTextField id="priority" name="priority" aria-describedby="priority-hint" />
        <TextFieldError name="priority" />
      </div>
      <fieldset>
        <legend>Action</legend>
        <RadioGroup column name="action">
          <Radio value="allow">Allow</Radio>
          <Radio value="deny">Deny</Radio>
        </RadioGroup>
      </fieldset>
      <fieldset>
        <legend>Direction of traffic</legend>
        <RadioGroup column name="direction">
          <Radio value="inbound">Incoming</Radio>
          <Radio value="outbound">Outgoing</Radio>
        </RadioGroup>
      </fieldset>

      <Divider />

      <h3 className="mb-4 text-sans-xl">Targets</h3>
      <Dropdown
        label="Target type"
        items={[
          { value: 'vpc', label: 'VPC' },
          { value: 'subnet', label: 'VPC Subnet' },
          { value: 'instance', label: 'Instance' },
        ]}
        onChange={(item) => {
          setFieldValue('targetType', item?.value)
        }}
      />
      <div className="space-y-0.5">
        <FieldLabel id="targetValue-label" htmlFor="targetValue">
          Target name
        </FieldLabel>
        <TextField id="targetValue" name="targetValue" />
      </div>

      <div className="flex justify-end">
        {/* TODO does this clear out the form or the existing targets? */}
        <Button variant="ghost" color="neutral" className="mr-2.5">
          Clear
        </Button>
        <Button
          variant="secondary"
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
      <Dropdown
        label="Host type"
        items={[
          { value: 'vpc', label: 'VPC' },
          { value: 'subnet', label: 'VPC Subnet' },
          { value: 'instance', label: 'Instance' },
          { value: 'ip', label: 'IP' },
          { value: 'internet_gateway', label: 'Internet Gateway' },
        ]}
        onChange={(item) => {
          setFieldValue('hostType', item?.value)
        }}
      />
      <div className="space-y-0.5">
        {/* For everything but IP this is a name, but for IP it's an IP. 
          So we should probably have the label on this field change when the
          host type changes. Also need to confirm that it's just an IP and 
          not a block. */}
        <FieldLabel id="hostValue-label" htmlFor="hostValue">
          Value
        </FieldLabel>
        <TextFieldHint id="hostValue-hint">
          For IP, an address. For the rest, a name. [TODO: copy]
        </TextFieldHint>
        <TextField id="hostValue" name="hostValue" aria-describedby="hostValue-hint" />
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" color="neutral" className="mr-2.5">
          Clear
        </Button>
        <Button
          variant="secondary"
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

      <div className="space-y-0.5">
        <FieldLabel id="portRange-label" htmlFor="portRange">
          Port filter
        </FieldLabel>
        <TextFieldHint id="portRange-hint">
          A single port (1234) or a range (1234-2345)
        </TextFieldHint>
        <TextField id="portRange" name="portRange" aria-describedby="portRange-hint" />
        <TextFieldError name="portRange" />
        <div className="flex justify-end">
          <Button variant="ghost" color="neutral" className="mr-2.5">
            Clear
          </Button>
          <Button
            variant="secondary"
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

type Props = PrebuiltFormProps<FirewallRuleValues, VpcFirewallRules> & {
  existingRules: VpcFirewallRule[]
}

export function CreateFirewallRuleForm({ onSuccess, existingRules, ...props }: Props) {
  const parentNames = useParams('orgName', 'projectName', 'vpcName')
  const queryClient = useApiQueryClient()

  const updateRules = useApiMutation('vpcFirewallRulesPut', {
    onSuccess(data) {
      queryClient.invalidateQueries('vpcFirewallRulesGet', parentNames)
      onSuccess?.(data)
    },
  })

  return (
    <Form
      id="create-firewall-rule-form"
      title="Add firewall rule"
      initialValues={initialValues}
      onSubmit={(values) => {
        // TODO: this silently overwrites existing rules with the current name.
        // we should probably at least warn and confirm, if not reject as invalid
        const otherRules = existingRules
          .filter((r) => r.name !== values.name)
          .map(firewallRuleGetToPut)
        updateRules.mutate({
          ...parentNames,
          body: {
            rules: [...otherRules, valuesToRuleUpdate(values)],
          },
        })
      }}
      mutation={updateRules}
      validationSchema={validationSchema}
      validateOnBlur
      {...props}
    >
      <CommonFields error={updateRules.error} />
      <Form.Actions>
        <Form.Submit>Add rule</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}
