import type { VpcFirewallRuleStatus } from '@oxide/api'
import { Badge, Success12Icon } from '@oxide/ui'
import React from 'react'
import type { Cell } from '.'

export const EnabledCell = ({ value }: Cell<VpcFirewallRuleStatus>) =>
  value === 'enabled' ? (
    <>
      <Success12Icon className="mr-1 text-accent" />
      <Badge variant="dim">Enabled</Badge>
    </>
  ) : (
    <>
      <Success12Icon className="mr-1 text-notice" />
      <Badge color="notice" variant="dim">
        Disabled
      </Badge>
    </>
  )
