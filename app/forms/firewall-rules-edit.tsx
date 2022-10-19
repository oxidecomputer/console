import type { VpcFirewallRule, VpcFirewallRules } from '@oxide/api'
import { firewallRuleGetToPut, useApiMutation, useApiQueryClient } from '@oxide/api'

import { Form, SideModalForm } from 'app/components/form'
import { useRequiredParams } from 'app/hooks'

import type { EditSideModalFormProps } from '.'
import { CommonFields, validationSchema, valuesToRuleUpdate } from './firewall-rules-create'
import type { FirewallRuleValues } from './firewall-rules-create'

type EditFirewallRuleSideModalFormProps = Omit<
  EditSideModalFormProps<FirewallRuleValues, VpcFirewallRules>,
  'initialValues'
> & {
  originalRule: VpcFirewallRule
  existingRules: VpcFirewallRule[]
}

export function EditFirewallRuleForm({
  onSuccess,
  onDismiss,
  existingRules,
  originalRule,
  ...props
}: EditFirewallRuleSideModalFormProps) {
  const parentNames = useRequiredParams('orgName', 'projectName', 'vpcName')
  const queryClient = useApiQueryClient()

  const updateRules = useApiMutation('vpcFirewallRulesUpdate', {
    onSuccess(data) {
      queryClient.invalidateQueries('vpcFirewallRulesView', { path: parentNames })
      onSuccess?.(data)
      onDismiss()
    },
  })

  if (Object.keys(originalRule).length === 0) return null

  const initialValues: FirewallRuleValues = {
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
    <SideModalForm
      id="create-firewall-rule-form"
      title="Edit rule"
      initialValues={initialValues}
      onDismiss={onDismiss}
      onSubmit={(values) => {
        // note different filter logic from create: filter out the rule with the
        // *original* name because we need to overwrite that rule
        const otherRules = existingRules
          .filter((r) => r.name !== originalRule.name)
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
      <Form.Submit>Update rule</Form.Submit>
    </SideModalForm>
  )
}
