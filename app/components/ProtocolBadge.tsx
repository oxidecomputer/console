/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Badge } from '@oxide/design-system/ui'

import type { VpcFirewallRuleProtocol } from '~/api'
import { PROTOCOL_LABELS } from '~/util/protocol'

export const ProtocolBadge = ({ protocol }: { protocol: VpcFirewallRuleProtocol }) => {
  const label = PROTOCOL_LABELS[protocol.type]
  if (protocol.type === 'tcp' || protocol.type === 'udp') return <Badge>{label}</Badge>
  if (protocol.value === null) return <Badge>{label}</Badge>

  const { icmpType, code } = protocol.value
  return (
    <div className="space-x-0.5">
      <Badge>{label}</Badge>
      <Badge variant="solid">
        <span className="flex items-center gap-1.5">
          <span>type {icmpType}</span>
          {code && (
            <>
              <span className="border-l-accent-secondary h-2.5 border-l" />
              <span>code {code}</span>
            </>
          )}
        </span>
      </Badge>
    </div>
  )
}
