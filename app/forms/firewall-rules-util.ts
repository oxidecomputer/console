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

  protocols: string[] // Form stores simple strings, converted to objects on submit
  icmpType?: string

  ports: NonNullable<VpcFirewallRule['filters']['ports']>
  hosts: NonNullable<VpcFirewallRule['filters']['hosts']>
  targets: VpcFirewallRuleTarget[]
}

export const ruleToFormValues = (rule: VpcFirewallRule): FirewallRuleValues => {
  // Convert API protocol objects back to simple strings
  const protocols = rule.filters.protocols?.map((p) => p.type) || []

  // Extract ICMP type if present
  let icmpType: string | undefined
  const icmpProtocol = rule.filters.protocols?.find((p) => p.type === 'icmp')
  if (icmpProtocol?.value?.icmpType !== undefined) {
    icmpType = icmpProtocol.value.icmpType.toString()
  } else if (icmpProtocol?.value === null) {
    icmpType = 'null' // "All ICMP" option
  }

  return {
    enabled: rule.status === 'enabled',
    priority: rule.priority,
    name: rule.name,
    description: rule.description,
    action: rule.action,
    direction: rule.direction,
    protocols,
    icmpType,
    ports: rule.filters.ports || [],
    hosts: rule.filters.hosts || [],
    targets: rule.targets,
  }
}

export const valuesToRuleUpdate = (values: FirewallRuleValues): VpcFirewallRuleUpdate => {
  // Convert string protocols to proper protocol objects
  const protocols = values.protocols.map((protocolStr) => {
    if (protocolStr === 'icmp') {
      // For ICMP, include the type if specified, otherwise allow all ICMP
      if (values.icmpType && values.icmpType !== 'null') {
        const icmpTypeNum = parseInt(values.icmpType, 10)
        if (isNaN(icmpTypeNum)) {
          console.error('Invalid icmpType:', values.icmpType)
          throw new Error(`Invalid ICMP type: ${values.icmpType}`)
        }
        return {
          type: 'icmp' as const,
          value: { icmpType: icmpTypeNum },
        }
      } else {
        // No specific ICMP type (allow all) - use null value
        return { type: 'icmp' as const, value: null }
      }
    } else if (protocolStr === 'tcp') {
      return { type: 'tcp' as const }
    } else if (protocolStr === 'udp') {
      return { type: 'udp' as const }
    }

    // Fallback, should not happen
    throw new Error(`Unknown protocol: ${protocolStr}`)
  })

  return {
    name: values.name,
    status: values.enabled ? 'enabled' : 'disabled',
    action: values.action,
    description: values.description,
    direction: values.direction,
    filters: {
      hosts: values.hosts,
      ports: values.ports,
      protocols,
    },
    priority: values.priority,
    targets: values.targets,
  }
}
