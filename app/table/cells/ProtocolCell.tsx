/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { VpcFirewallRuleProtocol } from '~/api'
import { Badge } from '~/ui/lib/Badge'
import { Tooltip } from '~/ui/lib/Tooltip'

import { EmptyCell } from './EmptyCell'

export const ProtocolCell = ({ protocol }: { protocol: VpcFirewallRuleProtocol }) => (
  <Badge>{protocol.type.toUpperCase()}</Badge>
)

/** Generate tooltip content for empty protocol cells in the mini table */
const protocolEmptyCellTooltipContent = (protocol: VpcFirewallRuleProtocol): string => {
  if (protocol.type === 'tcp') return 'This firewall rule will match all TCP traffic'
  if (protocol.type === 'udp') return 'This firewall rule will match all UDP traffic'
  // in this case, the user could be looking at the type column or the code column, but both get the same tooltip
  if (protocol.value === null) {
    return 'This firewall rule will match all ICMP traffic'
  }
  // in this case, there's an icmpType but no code, which means the user is looking at the code column
  return `This firewall rule will match all ICMP traffic of type ${protocol.value.icmpType}`
}

export const ProtocolEmptyCell = ({ protocol }: { protocol: VpcFirewallRuleProtocol }) => (
  <Tooltip content={protocolEmptyCellTooltipContent(protocol)} placement="top">
    <div>
      <EmptyCell />
    </div>
  </Tooltip>
)

export const ProtocolTypeCell = ({ protocol }: { protocol: VpcFirewallRuleProtocol }) =>
  // icmpType could be zero, so we check for `not undefined`
  protocol.type === 'icmp' && protocol.value?.icmpType !== undefined ? (
    protocol.value.icmpType
  ) : (
    <ProtocolEmptyCell protocol={protocol} />
  )

export const ProtocolCodeCell = ({ protocol }: { protocol: VpcFirewallRuleProtocol }) =>
  // code could be zero, so we check for `not undefined`
  protocol.type === 'icmp' && protocol.value?.code !== undefined ? (
    protocol.value.code
  ) : (
    <ProtocolEmptyCell protocol={protocol} />
  )
