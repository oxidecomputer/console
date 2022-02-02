import React from 'react'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'

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
import type { VpcFirewallRule, ErrorResponse } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { getServerError } from 'app/util/errors'

type FormProps = {
  error: ErrorResponse | null
  id: string
}

// the moment the two forms diverge, inline them rather than introducing BS
// props here
const CommonForm = ({ id, error }: FormProps) => (
  <Form id={id}>
    <SideModal.Section>
      <div className="space-y-0.5">
        <FieldTitle htmlFor="priority">Priority</FieldTitle>
        <TextFieldHint id="priority-hint">Must be 0&ndash;65535</TextFieldHint>
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
      />
      <div className="space-y-0.5">
        <FieldTitle htmlFor="target-name">Name</FieldTitle>
        <TextField id="target-name" name="target-name" />
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" className="mr-2.5">
          Clear
        </Button>
        <Button variant="dim">Add target</Button>
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
          <Table.Row>
            <Table.Cell>VPC</Table.Cell>
            <Table.Cell>target-vpc</Table.Cell>
            <Table.Cell>
              <Delete10Icon className="cursor-pointer" />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>VPC Subnet</Table.Cell>
            <Table.Cell>target-subnet</Table.Cell>
            <Table.Cell>
              <Delete10Icon className="cursor-pointer" />
            </Table.Cell>
          </Table.Row>
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
      />
      <div className="space-y-0.5">
        {/* For everything but IP this is a name, but for IP it's an IP. 
          So we should probably have the label on this field change when the
          host type changes. Also need to confirm that it's just an IP and 
          not a block. */}
        <FieldTitle htmlFor="host-filter-value">Value</FieldTitle>
        <TextFieldHint id="host-filter-value-hint">
          For IP, an address. For the rest, a name. [TODO: copy]
        </TextFieldHint>
        <TextField
          id="host-filter-value"
          name="host-filter-value"
          aria-describedby="host-filter-value-hint"
        />
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" className="mr-2.5">
          Clear
        </Button>
        <Button variant="dim">Add host filter</Button>
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
          <Table.Row>
            <Table.Cell>VPC</Table.Cell>
            <Table.Cell>my-vpc</Table.Cell>
            <Table.Cell>
              <Delete10Icon className="cursor-pointer" />
            </Table.Cell>
          </Table.Row>
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
          <Button variant="dim">Add port filter</Button>
        </div>
        <ul>
          <li>
            1234
            <Delete10Icon className="cursor-pointer ml-2" />
          </li>
          <li>
            456-567
            <Delete10Icon className="cursor-pointer ml-2" />
          </li>
          <li>
            8080-8086
            <Delete10Icon className="cursor-pointer ml-2" />
          </li>
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
    <SideModal.Section className="border-t">
      {/* omitting value prop makes it a boolean value. beautiful */}
      <CheckboxField name="enabled">Enabled</CheckboxField>
      <div className="space-y-0.5">
        <FieldTitle htmlFor="subnet-name" tip="The name of the subnet">
          Name
        </FieldTitle>
        <TextField id="subnet-name" name="name" />
      </div>
      <div className="space-y-0.5">
        <FieldTitle
          htmlFor="subnet-description"
          tip="A description for the subnet"
        >
          Description {/* TODO: indicate optional */}
        </FieldTitle>
        <TextField id="subnet-description" name="description" />
      </div>
    </SideModal.Section>
    <SideModal.Section>
      <div className="text-red-500">{getServerError(error)}</div>
    </SideModal.Section>
  </Form>
)

type CreateProps = {
  isOpen: boolean
  onDismiss: () => void
  orgName: string
  projectName: string
  vpcName: string
}

export function CreateFirewallRuleModal({
  isOpen,
  onDismiss,
  orgName,
  projectName,
  vpcName,
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

  const formId = 'create-vpc-subnet-form'

  return (
    <SideModal
      id="create-firewall-rule-modal"
      title="Create firewall rule"
      isOpen={isOpen}
      onDismiss={dismiss}
    >
      <Formik
        initialValues={{
          enabled: false,
          priority: '',
          name: '',
          description: '',
          action: 'allow',
          direction: 'inbound',
          // TODO: in the request body, these go in a `filters` object. we probably don't
          // need such nesting here though. not even sure how to do it
          // filters
          protocols: [],
          ports: [],
          hosts: [],
          targets: [],
        }}
        validationSchema={Yup.object({
          priority: Yup.number()
            .integer()
            .min(0)
            .max(65535)
            .required('Required'),
        })}
        validateOnBlur
        onSubmit={({ name, enabled, ...rest }) => {
          console.log({ name, enabled, ...rest })
          // const status = values.enabled ? 'enabled' : 'disabled'
          // createRule.mutate({
          //   ...parentIds,
          //   body: {
          //     [name]: { status, ...rest},
          //   },
          // })
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
      queryClient.invalidateQueries('vpcSubnetsGet', parentIds)
      dismiss()
    },
  })

  if (!originalRule) return null

  const formId = 'edit-vpc-subnet-form'
  return (
    <SideModal
      id="edit-vpc-subnet-modal"
      title="Edit subnet"
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
          Update subnet
        </Button>
      </SideModal.Footer>
    </SideModal>
  )
}
