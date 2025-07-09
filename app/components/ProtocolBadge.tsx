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

  return (
    <div className="space-x-0.5">
      <Badge>ICMP</Badge>
      <Badge variant="solid" className="!normal-case">
        type {protocol.value.icmpType}
        {protocol.value.code && (
          <>
            <span className="mx-1.5 inline-block h-2 border-l opacity-30 border-l-tertiary" />
            {protocol.value.code.includes('-') ? 'codes' : 'code'} {protocol.value.code}
          </>
        )}
      </Badge>
    </div>
  )
}
