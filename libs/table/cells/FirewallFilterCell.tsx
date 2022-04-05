import React from 'react'
import type {
  VpcFirewallRuleFilter,
  VpcFirewallRuleHostFilter,
} from '@oxide/api'
import { ipNetToStr } from '@oxide/api'
import { Badge } from '@oxide/ui'
import type { Cell, TypeValue } from '.'
import { TypeValueCell } from '.'

/** The `value` on `ip_net` type is not a string, so we have to make it a string */
const hostFilterToTypeValue = (h: VpcFirewallRuleHostFilter): TypeValue => ({
  type: h.type,
  value: h.type === 'ip_net' ? ipNetToStr(h.value) : h.value,
})

export const FirewallFilterCell = ({
  value: { hosts, ports, protocols },
}: Cell<VpcFirewallRuleFilter>) => (
  <div className="space-x-1">
    {hosts &&
      hosts
        .map(hostFilterToTypeValue)
        .map((tv, i) => <TypeValueCell key={`${tv}-${i}`} value={tv} />)}
    {protocols &&
      protocols.map((p, i) => (
        <Badge key={`${p}-${i}`} variant="secondary">
          {p}
        </Badge>
      ))}
    {ports && ports.map((p, i) => <Badge key={`${p}-${i}`}>{p}</Badge>)}
  </div>
)
