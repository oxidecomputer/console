/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useApiQuery } from '~/api'
import { IpUtilCell } from '~/components/IpPoolUtilization'
import { EmptyCell } from '~/table/cells/EmptyCell'

export const UtilizationCell = ({ pool }: { pool: string }) => {
  const { data } = useApiQuery('ipPoolUtilizationView', { path: { pool } })

  if (!data) return <EmptyCell />
  return <IpUtilCell {...data} />
}
