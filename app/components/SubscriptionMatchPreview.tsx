/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { AlertClassResultsPage } from '@oxide/api'

import {
  ALERT_SUBSCRIPTION_REGEX,
  isGlobPattern,
  isSubscribableClass,
  subscriptionRegex,
} from '~/api/util'
import { AlertClassBadge } from '~/components/AlertClassBadge'

/**
 * For a glob subscription pattern, show which alert classes it currently
 * matches. Renders nothing for exact (non-glob) patterns.
 * Note the match set is point-in-time: globs are re-evaluated by the control
 * plane as alert classes are added.
 */
export function SubscriptionMatchPreview({
  data,
  pattern,
}: {
  data: AlertClassResultsPage | undefined
  pattern: string
}) {
  // validate before subscriptionRegex, which assumes a well-formed subscription
  const isValidGlob = isGlobPattern(pattern) && ALERT_SUBSCRIPTION_REGEX.test(pattern)
  if (!isValidGlob || !data) return null

  const re = subscriptionRegex(pattern)
  // the probe class can't be subscribed to, so don't count it as a match
  const classes = data.items.filter(isSubscribableClass).filter((c) => re.test(c.name))

  if (classes.length === 0) {
    return (
      <p className="text-sans-sm text-secondary">
        No current alert classes match this pattern. It may match classes added in the
        future.
      </p>
    )
  }

  return (
    <p className="text-sans-sm text-secondary">
      Matches {classes.length} alert {classes.length === 1 ? 'class' : 'classes'}:{' '}
      <span className="inline-flex flex-wrap gap-1 align-bottom">
        {classes.map((c) => (
          <AlertClassBadge key={c.name}>{c.name}</AlertClassBadge>
        ))}
      </span>
    </p>
  )
}
