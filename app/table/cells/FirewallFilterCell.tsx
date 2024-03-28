/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { VpcFirewallRuleFilter } from '@oxide/api'

import { Badge } from '~/ui/lib/Badge'

import { type Cell } from './Cell'
import { TypeValueCell } from './TypeValueCell'

export const FirewallFilterCell = ({
  value: { hosts, ports, protocols },
}: Cell<VpcFirewallRuleFilter>) => (
  <div className="flex flex-col gap-1">
    <div className="flex flex-col gap-1">
      {hosts?.map((tv, i) => <TypeValueCell key={`${tv}-${i}`} value={tv} />)}
    </div>
    <div className="flex gap-1">
      {protocols?.map((p, i) => <Badge key={`${p}-${i}`}>{p}</Badge>)}
      {ports?.map((p, i) => (
        <Badge key={`${p}-${i}`} variant="solid">
          {p}
        </Badge>
      ))}
    </div>
  </div>
)
