/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'

import { api, q } from '@oxide/api'
import { Badge } from '@oxide/design-system/ui'

import { ALERT_SUBSCRIPTION_REGEX, isSubscribableClass } from '~/api/util'

/**
 * For a glob subscription pattern, show which alert classes it currently
 * matches, using the API's own matching logic (`alertClassList` accepts a
 * subscription as a filter). Renders nothing for exact (non-glob) patterns.
 * Note the match set is point-in-time: globs are re-evaluated by the control
 * plane as alert classes are added.
 */
export function SubscriptionMatchPreview({ pattern }: { pattern: string }) {
  const isGlob = pattern.includes('*')
  const valid = ALERT_SUBSCRIPTION_REGEX.test(pattern)
  const enabled = valid && isGlob
  const { data } = useQuery(
    q(api.alertClassList, { query: { filter: pattern } }, { enabled })
  )

  if (!enabled || !data) return null

  // the probe class can't be subscribed to, so don't count it as a match
  const classes = data.items.filter(isSubscribableClass)

  if (classes.length === 0) {
    return (
      <p className="text-sans-sm text-secondary">
        No current event classes match this pattern. It may match classes added in the
        future.
      </p>
    )
  }

  return (
    <p className="text-sans-sm text-secondary">
      Matches {classes.length} event {classes.length === 1 ? 'class' : 'classes'}:{' '}
      <span className="inline-flex flex-wrap gap-1 align-bottom">
        {classes.map((c) => (
          <Badge key={c.name} color="neutral">
            {c.name}
          </Badge>
        ))}
      </span>
    </p>
  )
}
