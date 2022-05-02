import type { VpcFirewallRule, VpcFirewallRules } from '@oxide/api'
import { useApiMutation, useApiQueryClient, firewallRuleGetToPut } from '@oxide/api'
import { Form } from 'app/components/form'
import { useParams } from 'app/hooks'
import type { PrebuiltFormProps } from '.'
import { CommonFields, validationSchema, valuesToRuleUpdate } from './firewall-rules-create'
import type { FirewallRuleValues } from './firewall-rules-create'

type Props = PrebuiltFormProps<FirewallRuleValues, VpcFirewallRules> & {
  originalRule: VpcFirewallRule
  existingRules: VpcFirewallRule[]
}

export function EditFirewallRuleForm({
  onSuccess,
  existingRules,
  originalRule,
  ...props
}: Props) {
  const parentNames = useParams('orgName', 'projectName', 'vpcName')
  const queryClient = useApiQueryClient()

  const updateRules = useApiMutation('vpcFirewallRulesPut', {
    onSuccess(data) {
      queryClient.invalidateQueries('vpcFirewallRulesGet', parentNames)
      onSuccess?.(data)
    },
  })

  const initialValues = {
    enabled: originalRule.status === 'enabled',
    name: originalRule.name,
    description: originalRule.description,

    priority: originalRule.priority.toString(),
    action: originalRule.action,
    direction: originalRule.direction,

    protocols: originalRule.filters.protocols || [],

    // port subform
    ports: originalRule.filters.ports || [],
    portRange: '',

    // host subform
    hosts: originalRule.filters.hosts || [],
    hostType: '',
    hostValue: '',

    // target subform
    targets: originalRule.targets,
    targetType: '',
    targetValue: '',
  }

  return (
    <Form
      id="create-firewall-rule-form"
      title="Edit rule"
      initialValues={initialValues}
      onSubmit={(values) => {
        // note different filter logic from create: filter out the rule with the
        // *original* name because we need to overwrite that rule
        const otherRules = existingRules
          .filter((r) => r.name !== originalRule.name)
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
        <Form.Submit>Update rule</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}
