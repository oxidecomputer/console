/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import {
  api,
  apiq,
  firewallRuleGetToPut,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
} from '@oxide/api'

import { trigger404 } from '~/components/ErrorBoundary'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import {
  getFirewallRuleSelector,
  useFirewallRuleSelector,
  useVpcSelector,
} from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { ALL_ISH } from '~/util/consts'
import { invariant } from '~/util/invariant'
import { pb } from '~/util/path-builder'

import { CommonFields } from './firewall-rules-common'
import { valuesToRuleUpdate, type FirewallRuleValues } from './firewall-rules-util'

export const handle = titleCrumb('Edit Rule')

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project, vpc, rule } = getFirewallRuleSelector(params)

  const [firewallRules] = await Promise.all([
    queryClient.fetchQuery(
      apiq(api.methods.vpcFirewallRulesView, { query: { project, vpc } })
    ),
    queryClient.prefetchQuery(
      apiq(api.methods.instanceList, { query: { project, limit: ALL_ISH } })
    ),
    queryClient.prefetchQuery(
      apiq(api.methods.vpcList, { query: { project, limit: ALL_ISH } })
    ),
    queryClient.prefetchQuery(
      apiq(api.methods.vpcSubnetList, { query: { project, vpc, limit: ALL_ISH } })
    ),
  ])

  const originalRule = firewallRules.rules.find((r) => r.name === rule)
  if (!originalRule) throw trigger404

  return null
}

export default function EditFirewallRuleForm() {
  const { project, vpc, rule } = useFirewallRuleSelector()
  const vpcSelector = useVpcSelector()

  const { data: firewallRules } = usePrefetchedQuery(
    apiq(api.methods.vpcFirewallRulesView, { query: { project, vpc } })
  )

  const originalRule = firewallRules.rules.find((r) => r.name === rule)

  // we shouldn't hit this because of the trigger404 in the loader
  invariant(originalRule, 'Firewall rule must exist')

  const navigate = useNavigate()
  const onDismiss = () => navigate(pb.vpcFirewallRules(vpcSelector))

  const updateRules = useApiMutation(api.methods.vpcFirewallRulesUpdate, {
    onSuccess(_updatedRules, { body }) {
      // Nav before the invalidate because I once saw the above invariant fail
      // briefly after successful edit (error page flashed but then we land
      // on the rules list ok) and I think it was a race condition where the
      // invalidate managed to complete while the modal was still open.
      onDismiss()
      queryClient.invalidateEndpoint('vpcFirewallRulesView')

      // We are pretty sure here that there is a rule in the list because we are
      // in the form updating it. We also know the one being updated is last in
      // the body because we put it it here. We use the request body instead of
      // the response because the server could change the order.
      const updatedRule = body.rules?.at(-1)
      if (updatedRule) {
        addToast(<>Firewall rule <HL>{updatedRule.name}</HL> updated</>) // prettier-ignore
      }
    },
  })

  const defaultValues: FirewallRuleValues = {
    enabled: originalRule.status === 'enabled',
    name: originalRule.name,
    description: originalRule.description,

    action: originalRule.action,
    direction: originalRule.direction,
    priority: originalRule.priority,

    targets: originalRule.targets,
    ports: originalRule.filters.ports || [],
    protocols: originalRule.filters.protocols || [],
    hosts: originalRule.filters.hosts || [],
  }

  const form = useForm({ defaultValues })

  // TODO: uhhhh how can this happen
  if (Object.keys(originalRule).length === 0) return null

  // note different filter logic from create: filter out the rule with the
  // *original* name because we need to overwrite that rule
  const otherRules = firewallRules.rules.filter((r) => r.name !== originalRule.name)

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="rule"
      onDismiss={onDismiss}
      onSubmit={(values) =>
        updateRules.mutate({
          query: vpcSelector,
          body: {
            rules: [...otherRules.map(firewallRuleGetToPut), valuesToRuleUpdate(values)],
          },
        })
      }
      // validationSchema={validationSchema}
      // validateOnBlur
      loading={updateRules.isPending}
      submitError={updateRules.error}
    >
      <CommonFields
        control={form.control}
        // error if name is being changed to something that conflicts with some other rule
        nameTaken={(name) => !!otherRules.find((r) => r.name === name)}
        error={updateRules.error}
      />
    </SideModalForm>
  )
}
