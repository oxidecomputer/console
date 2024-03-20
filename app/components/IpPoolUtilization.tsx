/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { parseIpUtilization, type IpPoolUtilization } from '~/api'
import { Badge } from '~/ui/lib/Badge'
import { BigNum } from '~/ui/lib/BigNum'

const IpUtilFrac = (props: { allocated: number | bigint; capacity: number | bigint }) => (
  <>
    <BigNum className="text-default" num={props.allocated} /> /{' '}
    <BigNum className="text-tertiary" num={props.capacity} />
  </>
)

export function IpUtilCell(util: IpPoolUtilization) {
  const { ipv4, ipv6 } = parseIpUtilization(util)

  if (ipv6.capacity === 0n) {
    return (
      <div className="space-y-1">
        <IpUtilFrac {...ipv4} />
      </div>
    )
  }

  // the API doesn't let you add IPv6 ranges, but there's a remote possibility
  // a pool already exists with IPv6 ranges, so we might as well show that. also
  // this is nice for e2e testing the utilization logic
  return (
    <div className="space-y-1">
      <div>
        <Badge color="neutral" className="mr-2 !normal-case">
          v4
        </Badge>
        <IpUtilFrac {...ipv4} />
      </div>
      <div>
        <Badge color="neutral" className="mr-2 !normal-case">
          v6
        </Badge>
        <IpUtilFrac {...ipv6} />
      </div>
    </div>
  )
}
