/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { VpcFirewallRuleProtocol } from '~/api'
import { Badge } from '~/ui/lib/Badge'

type ProtocolBadgeProps = {
  protocol: VpcFirewallRuleProtocol
}

export const ProtocolBadge = ({ protocol }: ProtocolBadgeProps) => {
  if (protocol.type === 'tcp' || protocol.type === 'udp') {
    return <Badge>{protocol.type.toUpperCase()}</Badge>
  }

  if (protocol.value === null) {
    // All ICMP types
    return <Badge>ICMP</Badge>
  }

  if (protocol.value.code) {
    // ICMP with type and code
    return (
      <div className="space-x-0.5">
        <Badge>ICMP</Badge>
        <Badge variant="solid">
          type {protocol.value.icmpType} | code
          {protocol.value.code.includes('-') ? 's' : ''} {protocol.value.code}
        </Badge>
      </div>
    )
  }

  // ICMP with type only
  return (
    <div className="space-x-0.5">
      <Badge>ICMP</Badge>
      <Badge variant="solid">type {protocol.value.icmpType}</Badge>
    </div>
  )
}
