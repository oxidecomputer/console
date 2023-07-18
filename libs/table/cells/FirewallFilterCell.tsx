/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { VpcFirewallRuleFilter } from '@oxide/api'
import { Badge } from '@oxide/ui'

import type { Cell } from '.'
import { TypeValueCell } from '.'

export const FirewallFilterCell = ({
  value: { hosts, ports, protocols },
}: Cell<VpcFirewallRuleFilter>) => (
  <div className="space-x-1">
    {hosts && hosts.map((tv, i) => <TypeValueCell key={`${tv}-${i}`} value={tv} />)}
    {protocols &&
      protocols.map((p, i) => (
        <Badge key={`${p}-${i}`} variant="default">
          {p}
        </Badge>
      ))}
    {ports && ports.map((p, i) => <Badge key={`${p}-${i}`}>{p}</Badge>)}
  </div>
)
