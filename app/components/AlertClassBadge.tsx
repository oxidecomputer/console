/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useRef, useState } from 'react'

import { Badge } from '@oxide/design-system/ui'

import { Tooltip } from '~/ui/lib/Tooltip'

/**
 * Badge for an alert class or subscription glob. Badges uppercase their text
 * by default, but alert classes are lowercase in the API and someone who copies
 * one out of the UI needs it to work as a subscription, so keep the case.
 *
 * Long classes truncate to fit their container, with the full name in a
 * tooltip when that happens.
 */
export const AlertClassBadge = ({ children }: { children: string }) => {
  const ref = useRef<HTMLSpanElement>(null)
  const [truncated, setTruncated] = useState(false)

  // Checked lazily on hover, like `Truncate`, so there's no per-badge
  // ResizeObserver and the answer can't go stale between resize and hover
  const checkTruncation = () => {
    const el = ref.current
    if (el) setTruncated(el.scrollWidth > el.clientWidth)
  }

  return (
    // Badge doesn't forward refs or event handlers, so the tooltip anchors to a
    // wrapper and the overflow check lives on our own span inside the badge
    <Tooltip content={truncated ? children : undefined} delay={300}>
      <span className="inline-flex max-w-full min-w-0">
        <Badge color="neutral" className="max-w-full min-w-0 normal-case! *:min-w-0">
          <span ref={ref} className="block truncate" onPointerEnter={checkTruncation}>
            {children}
          </span>
        </Badge>
      </span>
    </Tooltip>
  )
}
