/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Badge } from '@oxide/design-system/components'

import type { VpcFirewallRuleProtocol } from '~/api'

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
      <Badge variant="solid">
        <span className="flex items-center gap-1.5">
          <span>type {protocol.value.icmpType}</span>
          {protocol.value.code && (
            <>
              <span className="border-l-accent-secondary h-[10px] border-l" />
              <span>code {protocol.value.code}</span>
            </>
          )}
        </span>
      </Badge>
    </div>
  )
}
