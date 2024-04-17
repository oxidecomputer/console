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
import { useTimeout } from '~/ui/lib/use-timeout'

export function RefreshButton({ onClick }: { onClick: () => void }) {
  // fake timer on fetching because it's too annoying to actually track it
  const [refreshing, setRefreshing] = useState(false)
  useTimeout(() => setRefreshing(false), refreshing ? 500 : null)

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => {
        onClick()
        setRefreshing(true)
      }}
      aria-label="Refresh data"
    >
      <SpinnerLoader isLoading={refreshing}>
        <Refresh16Icon />
      </SpinnerLoader>
    </Button>
  )
}
