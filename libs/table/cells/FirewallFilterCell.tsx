/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { VpcFirewallRuleFilter } from '@oxide/api'
import { Badge } from '@oxide/ui'

import { type Cell } from '.'

export const FirewallFilterCell = ({
  value: { hosts, ports, protocols },
}: Cell<VpcFirewallRuleFilter>) => (
  <div className="flex flex-col gap-1">
    {hosts &&
      hosts.map(({ type, value }) => (
        <div key={`${type}-${value}`} className="flex gap-0.5">
          <Badge>{type}</Badge>
          <Badge>{value}</Badge>
        </div>
      ))}
    <div className="flex gap-0.5">
      {protocols && protocols.map((p, i) => <Badge key={`${p}-${i}`}>{p}</Badge>)}
      {ports && ports.map((p, i) => <Badge key={`${p}-${i}`}>{p}</Badge>)}
    </div>
  </div>
)
