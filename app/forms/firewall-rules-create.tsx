/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, useParams, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  firewallRuleGetToPut,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type VpcFirewallRule,
} from '@oxide/api'

import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { getVpcSelector, useVpcSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'

import { CommonFields } from './firewall-rules-common'
import { valuesToRuleUpdate, type FirewallRuleValues } from './firewall-rules-util'

/** Empty form for when we're not creating from an existing rule */
const defaultValuesEmpty: FirewallRuleValues = {
  enabled: true,
  name: '',
  description: '',

  priority: 0,
  action: 'allow',
  direction: 'inbound',

  // in the request body, these go in a `filters` object. we probably don't
  // need such nesting here though. not even sure how to do it
  protocols: [],

  ports: [],
  hosts: [],
  targets: [],
}

/** convert in the opposite direction for when we're creating from existing rule */
const ruleToValues = (rule: VpcFirewallRule): FirewallRuleValues => ({
  ...rule,
  enabled: rule.status === 'enabled',
  protocols: rule.filters.protocols || [],
  ports: rule.filters.ports || [],
  hosts: rule.filters.hosts || [],
})

CreateFirewallRuleForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, vpc } = getVpcSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('vpcFirewallRulesView', { query: { project, vpc } }),
    apiQueryClient.prefetchQuery('instanceList', { query: { project, limit: ALL_ISH } }),
    apiQueryClient.prefetchQuery('vpcList', { query: { project, limit: ALL_ISH } }),
    apiQueryClient.prefetchQuery('vpcSubnetList', {
      query: { project, vpc, limit: ALL_ISH },
    }),
  ])

  return null
}

export function CreateFirewallRuleForm() {
  const vpcSelector = useVpcSelector()
  const queryClient = useApiQueryClient()

  const navigate = useNavigate()
  const onDismiss = () => navigate(pb.vpcFirewallRules(vpcSelector))

  const updateRules = useApiMutation('vpcFirewallRulesUpdate', {
    onSuccess(updatedRules) {
      const newRule = updatedRules.rules[updatedRules.rules.length - 1]
      queryClient.invalidateQueries('vpcFirewallRulesView')
      addToast(<>Firewall rule <HL>{newRule.name}</HL> created</>) // prettier-ignore
      navigate(pb.vpcFirewallRules(vpcSelector))
    },
  })

  const { data } = usePrefetchedApiQuery('vpcFirewallRulesView', { query: vpcSelector })
  const existingRules = data.rules

  // The :rule path param is optional. If it is present, we are creating a
  // rule from an existing one, so we find that rule and copy it into the form
  // values. Note that if we fail to find the rule by name (which should be
  // very unlikely) we just pretend we never saw a name in the path and start
  // from scratch.
  const { rule: ruleName } = useParams()
  const originalRule = existingRules.find((rule) => rule.name === ruleName)

  const defaultValues: FirewallRuleValues = originalRule
    ? ruleToValues({ ...originalRule, name: originalRule.name + '-copy' })
    : defaultValuesEmpty

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="rule"
      title="Add firewall rule"
      onDismiss={onDismiss}
      onSubmit={(values) => {
        updateRules.mutate({
          query: vpcSelector,
          body: {
            rules: [...existingRules.map(firewallRuleGetToPut), valuesToRuleUpdate(values)],
          },
        })
      }}
      loading={updateRules.isPending}
      submitError={updateRules.error}
      submitLabel="Add rule"
    >
      <CommonFields
        control={form.control}
        // error if name is already in use
        nameTaken={(name) => !!existingRules.find((r) => r.name === name)}
        error={updateRules.error}
        // TODO: there should also be a form-level error so if the name is off
        // screen, it doesn't look like the submit button isn't working. Maybe
        // instead of setting a root error, it would be more robust to show a
        // top level error if any errors are found in the form. We might want to
        // expand the submitError prop on SideModalForm for this
      />
    </SideModalForm>
  )
}
