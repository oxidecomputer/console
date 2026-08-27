/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Monitoring24Icon } from '@oxide/design-system/icons/react'

import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'

export const handle = { crumb: 'Alerts' }

export default function AlertsTab() {
  return (
    <TableEmptyBox>
      <EmptyMessage
        icon={<Monitoring24Icon />}
        title="No alerts"
        body="Alerts published by the system will appear here"
      />
    </TableEmptyBox>
  )
}
