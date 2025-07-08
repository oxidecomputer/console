/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { VpcFirewallRule, VpcFirewallRuleTarget, VpcFirewallRuleUpdate } from '~/api'

// this file is separate from firewall-rules-common because of rules around fast refresh:
// you can only export components from a file that exports components

export type FirewallRuleValues = {
  enabled: boolean
  priority: number
  name: string
  description: string
  action: VpcFirewallRule['action']
  direction: VpcFirewallRule['direction']

  protocols: NonNullable<VpcFirewallRule['filters']['protocols']> // Store full protocol objects

  ports: NonNullable<VpcFirewallRule['filters']['ports']>
  hosts: NonNullable<VpcFirewallRule['filters']['hosts']>
  targets: VpcFirewallRuleTarget[]
}

export const ruleToFormValues = (rule: VpcFirewallRule): FirewallRuleValues => {
  return {
    enabled: rule.status === 'enabled',
    priority: rule.priority,
    name: rule.name,
    description: rule.description,
    action: rule.action,
    direction: rule.direction,
    protocols: rule.filters.protocols || [],
    ports: rule.filters.ports || [],
    hosts: rule.filters.hosts || [],
    targets: rule.targets,
  }
}

export const valuesToRuleUpdate = (values: FirewallRuleValues): VpcFirewallRuleUpdate => {
  return {
    name: values.name,
    status: values.enabled ? 'enabled' : 'disabled',
    action: values.action,
    description: values.description,
    direction: values.direction,
    filters: {
      hosts: values.hosts,
      ports: values.ports,
      protocols: values.protocols,
    },
    priority: values.priority,
    targets: values.targets,
  }
}
