/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Badge } from '@oxide/design-system/ui'

import type { VpcFirewallRuleProtocol } from '~/api'
import { Tooltip } from '~/ui/lib/Tooltip'
import { PROTOCOL_LABELS } from '~/util/protocol'

import { EmptyCell } from './EmptyCell'

export const ProtocolCell = ({ protocol }: { protocol: VpcFirewallRuleProtocol }) => (
  <Badge>{PROTOCOL_LABELS[protocol.type]}</Badge>
)

/** Generate tooltip content for empty protocol cells in the mini table */
const protocolEmptyCellTooltipContent = (protocol: VpcFirewallRuleProtocol): string => {
  const label = PROTOCOL_LABELS[protocol.type]
  if (protocol.type === 'tcp' || protocol.type === 'udp' || protocol.value === null) {
    return `This firewall rule will match all ${label} traffic`
  }
  // type column shows nothing only when value is null (handled above), so
  // reaching here means we're in the code column and there is a type but no code
  return `This firewall rule will match all ${label} traffic of type ${protocol.value.icmpType}`
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
  (protocol.type === 'icmp' || protocol.type === 'icmp6') &&
  protocol.value?.icmpType !== undefined ? (
    protocol.value.icmpType
  ) : (
    <ProtocolEmptyCell protocol={protocol} />
  )

export const ProtocolCodeCell = ({ protocol }: { protocol: VpcFirewallRuleProtocol }) =>
  // code could be zero, so we check for `not undefined`
  (protocol.type === 'icmp' || protocol.type === 'icmp6') &&
  protocol.value?.code !== undefined ? (
    protocol.value.code
  ) : (
    <ProtocolEmptyCell protocol={protocol} />
  )
