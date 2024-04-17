/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { animated, config, useTransition } from '@react-spring/web'
import { useState } from 'react'

import { Refresh16Icon, Success12Icon } from '@oxide/design-system/icons/react'

import { Button } from '~/ui/lib/Button'
import { SpinnerLoader } from '~/ui/lib/Spinner'
import { useTimeout } from '~/ui/lib/use-timeout'

export function RefreshButton({ onClick }: { onClick: () => Promise<void> }) {
  const [refreshing, setRefreshing] = useState(false)
  const [hasReloaded, setHasReloaded] = useState(false)
  useTimeout(() => setHasReloaded(false), hasReloaded ? 1000 : null)

  const transitions = useTransition(hasReloaded, {
    from: { opacity: 0, transform: 'scale(0.8)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0.8)' },
    config: config.stiff,
    trail: 100,
    initial: null,
  })

  async function refresh() {
    setRefreshing(true)
    await onClick()
    setRefreshing(false)
    setHasReloaded(true)
  }

  return (
    <Button size="icon" variant="ghost" onClick={refresh} aria-label="Refresh data">
      {transitions((styles, item) => (
        <animated.div
          style={styles}
          className="absolute inset-0 flex items-center justify-center"
        >
          {item ? (
            <Success12Icon className="text-accent bg-accent-secondary" />
          ) : (
            <SpinnerLoader isLoading={refreshing}>
              <Refresh16Icon />
            </SpinnerLoader>
          )}
        </animated.div>
      ))}
    </Button>
  )
}
