/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useState } from 'react'

import { Refresh16Icon } from '@oxide/design-system/icons/react'

import { Button } from '~/ui/lib/Button'
import { SpinnerLoader } from '~/ui/lib/Spinner'

export function RefreshButton({ onClick }: { onClick: () => Promise<void> }) {
  const [refreshing, setRefreshing] = useState(false)

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={async () => {
        setRefreshing(true)
        await onClick()
        setRefreshing(false)
      }}
      aria-label="Refresh data"
    >
      <SpinnerLoader isLoading={refreshing}>
        <Refresh16Icon />
      </SpinnerLoader>
    </Button>
  )
}
