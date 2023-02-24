import type { VpcFirewallRule } from '@oxide/api'
import { firewallRuleGetToPut, useApiMutation, useApiQueryClient } from '@oxide/api'

import { SideModalForm } from 'app/components/form'
import { useVpcSelector } from 'app/hooks'

import { CommonFields, valuesToRuleUpdate } from './firewall-rules-create'
import type { FirewallRuleValues } from './firewall-rules-create'

type EditFirewallRuleFormProps = {
  onDismiss: () => void
  existingRules: VpcFirewallRule[]
  originalRule: VpcFirewallRule
}

export function EditFirewallRuleForm({
  onDismiss,
  existingRules,
  originalRule,
}: EditFirewallRuleFormProps) {
  const vpcSelector = useVpcSelector()
  const queryClient = useApiQueryClient()

  const updateRules = useApiMutation('vpcFirewallRulesUpdateV1', {
    onSuccess() {
      queryClient.invalidateQueries('vpcFirewallRulesViewV1', { query: vpcSelector })
      onDismiss()
    },
  })

  if (Object.keys(originalRule).length === 0) return null

  const defaultValues: FirewallRuleValues = {
    enabled: originalRule.status === 'enabled',
    name: originalRule.name,
    description: originalRule.description,

    priority: originalRule.priority.toString(),
    action: originalRule.action,
    direction: originalRule.direction,

    protocols: originalRule.filters.protocols || [],

    ports: originalRule.filters.ports || [],
    hosts: originalRule.filters.hosts || [],
    targets: originalRule.targets,
  }

  return (
    <SideModalForm
      id="create-firewall-rule-form"
      title="Edit rule"
      formOptions={{ defaultValues }}
      onDismiss={onDismiss}
      onSubmit={(values) => {
        // note different filter logic from create: filter out the rule with the
        // *original* name because we need to overwrite that rule
        const otherRules = existingRules
          .filter((r) => r.name !== originalRule.name)
          .map(firewallRuleGetToPut)
        updateRules.mutate({
          query: vpcSelector,
          body: {
            rules: [...otherRules, valuesToRuleUpdate(values)],
          },
        })
      }}
      // validationSchema={validationSchema}
      // validateOnBlur
      loading={updateRules.isLoading}
      submitError={updateRules.error}
      submitLabel="Update rule"
    >
      {({ control }) => <CommonFields error={updateRules.error} control={control} />}
    </SideModalForm>
  )
}
