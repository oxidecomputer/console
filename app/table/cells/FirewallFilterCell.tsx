/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { VpcFirewallRuleFilter } from '@oxide/api'

import { ListPlusCell } from '~/components/ListPlusCell'
import { Badge } from '~/ui/lib/Badge'

import { TypeValueCell } from './TypeValueCell'

export const FirewallFilterCell = ({ hosts, ports, protocols }: VpcFirewallRuleFilter) => {
  const children = [
    ...(hosts || []).map((tv, i) => <TypeValueCell key={`${tv}-${i}`} {...tv} />),
    ...(protocols || []).map((p, i) => <Badge key={`${p}-${i}`}>{p}</Badge>),
    ...(ports || []).map((p, i) => (
      <TypeValueCell key={`port-${p}-${i}`} type="Port" value={p} />
    )),
  ]
  return (
    <ListPlusCell numInCell={2} tooltipTitle="Other filters">
      {children}
    </ListPlusCell>
  )
}
