import type { VpcFirewallRuleStatus } from '@oxide/api'
import { Badge, Success12Icon } from '@oxide/ui'
import React from 'react'
import type { Cell } from '.'

export const EnabledCell = ({ value }: Cell<VpcFirewallRuleStatus>) =>
  value === 'enabled' ? (
    <>
      <Success12Icon className="text-accent mr-1" />
      <Badge variant="dim">Enabled</Badge>
    </>
  ) : (
    <>
      <Success12Icon className="text-notice mr-1" />
      <Badge color="notice" variant="dim">
        Disabled
      </Badge>
    </>
  )
