/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { VpcFirewallRuleStatus } from '@oxide/api'
import { Badge, Success12Icon } from '@oxide/ui'

import type { Cell } from '.'

export const EnabledCell = ({ value }: Cell<VpcFirewallRuleStatus>) =>
  value === 'enabled' ? (
    <>
      <Success12Icon className="mr-1 text-accent" />
      <Badge>Enabled</Badge>
    </>
  ) : (
    <>
      <Success12Icon className="mr-1 text-notice" />
      <Badge color="notice">Disabled</Badge>
    </>
  )
