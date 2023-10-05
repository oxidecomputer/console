/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { VpcFirewallRule } from '@oxide/api'
import { firewallRuleGetToPut, useApiMutation, useApiQueryClient } from '@oxide/api'

import { SideModalForm } from 'app/components/form'
import { useForm, useVpcSelector } from 'app/hooks'

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

  const updateRules = useApiMutation('vpcFirewallRulesUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcFirewallRulesView')
      onDismiss()
    },
  })

  const defaultValues: FirewallRuleValues = {
    enabled: originalRule.status === 'enabled',
    name: originalRule.name,
    description: originalRule.description,

    priority: originalRule.priority,
    action: originalRule.action,
    direction: originalRule.direction,

    protocols: originalRule.filters.protocols || [],

    ports: originalRule.filters.ports || [],
    hosts: originalRule.filters.hosts || [],
    targets: originalRule.targets,
  }

  const form = useForm({ defaultValues })

  // TODO: uhhhh how can this happen
  if (Object.keys(originalRule).length === 0) return null

  return (
    <SideModalForm
      id="create-firewall-rule-form"
      title="Edit rule"
      form={form}
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
      loading={updateRules.isPending}
      submitError={updateRules.error}
      submitLabel="Update rule"
    >
      <CommonFields error={updateRules.error} control={form.control} />
    </SideModalForm>
  )
}
