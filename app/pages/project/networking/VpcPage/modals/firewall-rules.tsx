import React from 'react'
import { Form, Formik, useFormikContext } from 'formik'
import * as Yup from 'yup'
import { pick } from '@oxide/util'

import {
  Button,
  CheckboxField,
  Delete10Icon,
  Dropdown,
  FieldTitle,
  NumberTextField,
  Radio,
  RadioGroup,
  SideModal,
  Table,
  TextField,
  TextFieldError,
  TextFieldHint,
} from '@oxide/ui'
import type {
  VpcFirewallRule,
  ErrorResponse,
  VpcFirewallRuleUpdate,
  VpcFirewallRuleUpdateParams,
} from '@oxide/api'
import { parsePortRange, useApiMutation, useApiQueryClient } from '@oxide/api'
import { getServerError } from 'app/util/errors'

type FormProps = {
  error: ErrorResponse | null
  id: string
}

type Values = {
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

// TODO: pressing enter in ports, hosts, and targets value field should "submit" subform

// the moment the two forms diverge, inline them rather than introducing BS
// props here
const CommonForm = ({ id, error }: FormProps) => {
  const { setFieldValue, values } = useFormikContext<Values>()
  return (
    <Form id={id}>
      <SideModal.Section className="border-t">
        {/* omitting value prop makes it a boolean value. beautiful */}
        {/* TODO: better text or heading or tip or something on this checkbox */}
        <CheckboxField name="enabled">Enabled</CheckboxField>
        <div className="space-y-0.5">
          <FieldTitle htmlFor="rule-name">Name</FieldTitle>
          <TextField id="rule-name" name="name" />
        </div>
        <div className="space-y-0.5">
          <FieldTitle htmlFor="rule-description">
            Description {/* TODO: indicate optional */}
          </FieldTitle>
          <TextField id="rule-description" name="description" />
        </div>
      </SideModal.Section>
      <SideModal.Section>
        <div className="space-y-0.5">
          <FieldTitle htmlFor="priority">Priority</FieldTitle>
          <TextFieldHint id="priority-hint">
            Must be 0&ndash;65535
          </TextFieldHint>
          <NumberTextField
            id="priority"
            name="priority"
            aria-describedby="priority-hint"
          />
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
      </SideModal.Section>
      <SideModal.Section className="border-t">
        <h3 className="text-sans-xl mb-4">Targets</h3>
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
          <FieldTitle htmlFor="targetValue">Name</FieldTitle>
          <TextField id="targetValue" name="targetValue" />
        </div>

        <div className="flex justify-end">
          {/* TODO does this clear out the form or the existing targets? */}
          <Button variant="ghost" className="mr-2.5">
            Clear
          </Button>
          <Button
            variant="dim"
            onClick={() => {
              // TODO: show error instead of ignoring click
              if (
                values.targetType &&
                values.targetValue && // TODO: validate
                !values.targets.some(
                  (t) =>
                    t.value === values.targetValue &&
                    t.type === values.targetType
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
      </SideModal.Section>
      <SideModal.Section className="border-t">
        <h3 className="text-sans-xl mb-4">Host filters</h3>
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
          <FieldTitle htmlFor="hostValue">Value</FieldTitle>
          <TextFieldHint id="hostValue-hint">
            For IP, an address. For the rest, a name. [TODO: copy]
          </TextFieldHint>
          <TextField
            id="hostValue"
            name="hostValue"
            aria-describedby="hostValue-hint"
          />
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" className="mr-2.5">
            Clear
          </Button>
          <Button
            variant="dim"
            onClick={() => {
              // TODO: show error instead of ignoring click
              if (
                values.hostType &&
                values.hostValue && // TODO: validate
                !values.hosts.some(
                  (t) =>
                    t.value === values.hostValue || t.type === values.hostType
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
      </SideModal.Section>
      <SideModal.Section className="border-t">
        <div className="space-y-0.5">
          <FieldTitle htmlFor="portRange">Port filter</FieldTitle>
          <TextFieldHint id="portRange-hint">
            A single port (1234) or a range (1234-2345)
          </TextFieldHint>
          <TextField
            id="portRange"
            name="portRange"
            aria-describedby="portRange-hint"
          />
          <TextFieldError name="portRange" />
          <div className="flex justify-end">
            {/* TODO: ghost variant is wrong, we actually need a new one to match the design */}
            <Button variant="ghost" className="mr-2.5">
              Clear
            </Button>
            <Button
              variant="dim"
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
          <ul>
            {values.ports.map((p) => (
              <li key={p}>
                {p}
                <Delete10Icon
                  className="cursor-pointer ml-2"
                  onClick={() => {
                    setFieldValue(
                      'ports',
                      values.ports.filter((p1) => p1 !== p)
                    )
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      </SideModal.Section>
      <SideModal.Section className="border-t">
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
      </SideModal.Section>
      <SideModal.Section>
        <div className="text-red-500">{getServerError(error)}</div>
      </SideModal.Section>
    </Form>
  )
}

type CreateProps = {
  isOpen: boolean
  onDismiss: () => void
  orgName: string
  projectName: string
  vpcName: string
  existingRules: VpcFirewallRule[]
}

function rulesArrToObj(rules: VpcFirewallRule[]): VpcFirewallRuleUpdateParams {
  return Object.fromEntries(
    rules.map((rule) => {
      const ruleUpdate: NoExtraKeys<VpcFirewallRuleUpdate, VpcFirewallRule> =
        pick(
          rule,
          'action',
          'description',
          'direction',
          'filters',
          'priority',
          'status',
          'targets'
        )
      return [rule.name, ruleUpdate]
    })
  )
}

export function CreateFirewallRuleModal({
  isOpen,
  onDismiss,
  orgName,
  projectName,
  vpcName,
  existingRules,
}: CreateProps) {
  const parentIds = { orgName, projectName, vpcName }
  const queryClient = useApiQueryClient()

  function dismiss() {
    createRule.reset()
    onDismiss()
  }

  const createRule = useApiMutation('vpcFirewallRulesPut', {
    onSuccess() {
      queryClient.invalidateQueries('vpcFirewallRulesGet', parentIds)
      dismiss()
    },
  })

  const formId = 'create-firewall-rule-form'

  return (
    <SideModal
      id="create-firewall-rule-modal"
      title="Create firewall rule"
      isOpen={isOpen}
      onDismiss={dismiss}
    >
      <Formik
        initialValues={
          {
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
          } as Values // best way to tell formik this type
        }
        validationSchema={Yup.object({
          priority: Yup.number()
            .integer()
            .min(0)
            .max(65535)
            .required('Required'),
        })}
        validateOnBlur
        onSubmit={({ name, ...values }) => {
          console.log({ name, ...values })
          createRule.mutate({
            ...parentIds,
            body: {
              ...rulesArrToObj(existingRules),
              [name]: {
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
              },
            },
          })
        }}
      >
        <CommonForm id={formId} error={createRule.error} />
      </Formik>
      <SideModal.Footer>
        <Button variant="dim" className="mr-2.5" onClick={dismiss}>
          Cancel
        </Button>
        <Button form={formId} type="submit">
          Create rule
        </Button>
      </SideModal.Footer>
    </SideModal>
  )
}

// TODO: right now edit works like the other resources in that it only knows
// about the rule being modified and expects to send that straight to the PUT
// endpoint. In reality (at least for now) the PUT endpoint expects the full
// list of rules, which means the edit modal should take the full list plus an
// ID for the one being edited. Then it can apply the user's changes to that one
// and PUT the full list. I am putting off implementing this aspect of it
// because we will probably get a normal PUT endpoint that relieves us of having
// to do all that. See https://github.com/oxidecomputer/omicron/issues/623

type EditProps = {
  onDismiss: () => void
  orgName: string
  projectName: string
  vpcName: string
  originalRule: VpcFirewallRule | null
}

export function EditFirewallRuleModal({
  onDismiss,
  orgName,
  projectName,
  vpcName,
  originalRule,
}: EditProps) {
  const parentIds = { orgName, projectName, vpcName }
  const queryClient = useApiQueryClient()

  function dismiss() {
    updateRule.reset()
    onDismiss()
  }

  const updateRule = useApiMutation('vpcFirewallRulesPut', {
    onSuccess() {
      queryClient.invalidateQueries('vpcFirewallRulesGet', parentIds)
      dismiss()
    },
  })

  if (!originalRule) return null

  const formId = 'edit-firewall-rule-form'
  return (
    <SideModal
      id="edit-firewall-rule-modal"
      title="Edit rule"
      onDismiss={dismiss}
    >
      <Formik
        initialValues={{
          name: originalRule.name,
          description: originalRule.description,
        }}
        onSubmit={(_values) => {
          // updateRule.mutate({
          //   ...parentIds,
          //   body: {
          //     name,
          //     description,
          //   },
          // })
        }}
      >
        <CommonForm id={formId} error={updateRule.error} />
      </Formik>
      <SideModal.Footer>
        <Button variant="dim" className="mr-2.5" onClick={dismiss}>
          Cancel
        </Button>
        <Button form={formId} type="submit">
          Update rule
        </Button>
      </SideModal.Footer>
    </SideModal>
  )
}
