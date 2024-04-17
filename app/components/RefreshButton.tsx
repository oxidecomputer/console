/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Refresh16Icon } from '@oxide/design-system/icons/react'

import { Button } from '~/ui/lib/Button'

export function RefreshButton({ onClick }: { onClick: () => void }) {
  return (
    <Button size="icon" variant="ghost" onClick={onClick} aria-label="Refresh data">
      <Refresh16Icon />
    </Button>
  )
}
