/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { VpcFirewallRuleStatus } from '@oxide/api'
import { Disabled12Icon, Success12Icon } from '@oxide/design-system/icons/react'

import { Badge } from '~/ui/lib/Badge'

export const EnabledCell = ({ value }: { value: VpcFirewallRuleStatus }) =>
  value === 'enabled' ? (
    <>
      <Success12Icon className="text-accent mr-1" />
      <Badge>Enabled</Badge>
    </>
  ) : (
    <>
      <Disabled12Icon className="text-notice mr-1" />
      <Badge color="notice">Disabled</Badge>
    </>
  )
