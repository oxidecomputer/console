/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  firewallRuleGetToPut,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
} from '@oxide/api'
import { invariant } from '@oxide/util'

import { SideModalForm } from 'app/components/form'
import { getVpcSelector, useForm, useVpcFirewallRuleSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

import {
  CommonFields,
  valuesToRuleUpdate,
  type FirewallRuleValues,
} from './firewall-rules-create'

EditFirewallRuleForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, vpc } = getVpcSelector(params)
  await apiQueryClient.prefetchQuery('vpcFirewallRulesView', {
    query: { project, vpc },
  })
  return null
}

export function EditFirewallRuleForm() {
  const navigate = useNavigate()

  const { project, vpc, firewallRule } = useVpcFirewallRuleSelector()
  const { data } = usePrefetchedApiQuery('vpcFirewallRulesView', {
    query: { project, vpc },
  })

  const [existingRules, originalRule] = useMemo(() => {
    const rules = data?.rules || []

    return [rules, rules.find((rule) => rule.name === firewallRule)]
  }, [data, firewallRule])

  invariant(originalRule, 'Firewall rule must exist')

  const onDismiss = () => navigate(pb.vpcFirewallRules({ project, vpc }))

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
          query: { project, vpc },
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
