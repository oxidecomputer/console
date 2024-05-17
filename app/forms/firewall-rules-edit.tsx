/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  firewallRuleGetToPut,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
} from '@oxide/api'

import { SideModalForm } from '~/components/form/SideModalForm'
import {
  getVpcSelector,
  useForm,
  useVpcFirewallRuleSelector,
  useVpcSelector,
} from '~/hooks'
import { invariant } from '~/util/invariant'
import { pb } from '~/util/path-builder'

import {
  CommonFields,
  valuesToRuleUpdate,
  type FirewallRuleValues,
} from './firewall-rules-create'

EditFirewallRuleForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const vpcSelector = getVpcSelector(params)

  await apiQueryClient.prefetchQuery('vpcFirewallRulesView', {
    query: vpcSelector,
  })

  return null
}

export function EditFirewallRuleForm() {
  const vpcFirewallRuleSelector = useVpcFirewallRuleSelector()
  const vpcSelector = useVpcSelector()
  const queryClient = useApiQueryClient()

  const { data } = usePrefetchedApiQuery('vpcFirewallRulesView', {
    query: { project: vpcFirewallRuleSelector.project, vpc: vpcFirewallRuleSelector.vpc },
  })

  const existingRules = data.rules
  const originalRule = existingRules.find(
    (rule) => rule.name === vpcFirewallRuleSelector.firewallRule
  )

  invariant(originalRule, 'Firewall rule must exist')

  const navigate = useNavigate()
  const onDismiss = () => navigate(pb.vpcFirewallRules(vpcSelector))

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
      form={form}
      formType="edit"
      resourceName="rule"
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
    >
      <CommonFields error={updateRules.error} control={form.control} />
    </SideModalForm>
  )
}
