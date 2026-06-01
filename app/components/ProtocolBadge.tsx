/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { match } from 'ts-pattern'

import { Badge } from '@oxide/design-system/ui'

import type { VpcFirewallRuleProtocol } from '~/api'
import { PROTOCOL_LABELS } from '~/util/protocol'

export const ProtocolBadge = ({ protocol }: { protocol: VpcFirewallRuleProtocol }) => {
  // only ICMP v4/v6 carry a nullable type/code value; tcp/udp have none
  const value = match(protocol)
    .with({ type: 'tcp' }, { type: 'udp' }, () => null)
    .with({ type: 'icmp' }, { type: 'icmp6' }, (p) => p.value)
    .exhaustive()
  return (
    <div className="space-x-0.5">
      <Badge>{PROTOCOL_LABELS[protocol.type]}</Badge>
      {/* null value (or tcp/udp) means all types, so there's no type/code badge */}
      {value !== null && (
        <Badge variant="solid">
          <span className="flex items-center gap-1.5">
            <span>type {value.icmpType}</span>
            {value.code && (
              <>
                <span className="border-l-accent-secondary h-2.5 border-l" />
                <span>code {value.code}</span>
              </>
            )}
          </span>
        </Badge>
      )}
    </div>
  )
}
