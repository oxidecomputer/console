import type { VpcFirewallRuleFilter } from '@oxide/api'
import { Badge } from '@oxide/ui'
import React from 'react'
import type { Cell } from '.'
import { TypeValueCell } from '.'

export const FirewallFilterCell = ({
  value: { hosts, ports, protocols },
}: Cell<VpcFirewallRuleFilter>) => (
  <div className="space-x-1">
    {hosts &&
      hosts.map((h, i) => <TypeValueCell key={`${h}-${i}`} value={h} />)}
    {protocols &&
      protocols.map((p, i) => (
        <Badge key={`${p}-${i}`} variant="secondary">
          {p}
        </Badge>
      ))}
    {ports && ports.map((p, i) => <Badge key={`${p}-${i}`}>{p}</Badge>)}
  </div>
)
