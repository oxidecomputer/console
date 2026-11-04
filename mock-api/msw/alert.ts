/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as R from 'remeda'
import { match } from 'ts-pattern'

import type { ApiTypes as Api } from '@oxide/api'

import type { Json } from '~/api/__generated__/msw-handlers'
import {
  ALERT_SUBSCRIPTION_REGEX,
  isGlobPattern,
  isSubscribableClass,
  PROBE_ALERT_CLASS,
  subscriptionRegex,
} from '~/api/util'

import { alertClasses } from '../alert'
import { db, notFoundErr } from './db'
import { invalidRequest } from './util'

/**
 * Omicron parses an exact subscription as a known `AlertClass` and rejects
 * anything else, along with the synthetic `probe` class, with a 400. Mirror
 * that so the UI's pre-submit checks can be trusted against the mock.
 * https://github.com/oxidecomputer/omicron/blob/17e6fee/nexus/db-model/src/alert_subscription.rs#L61-L98
 */
export function validateSubscription(subscription: string) {
  if (!ALERT_SUBSCRIPTION_REGEX.test(subscription)) {
    throw invalidRequest(
      `unsupported value for "alert_class": invalid glob '${subscription}'`
    )
  }
  if (isGlobPattern(subscription)) return
  if (subscription === PROBE_ALERT_CLASS) {
    throw invalidRequest(
      `unsupported value for "alert_class": the 'probe' alert class is a synthetic alert used only for webhook liveness probes, and is not included in alert lists and cannot be subscribed to`
    )
  }
  if (!alertClasses.some((c) => c.name === subscription)) {
    const known = alertClasses.map((c) => c.name).join(', ')
    throw invalidRequest(`unsupported value for "alert_class": expected one of [${known}]`)
  }
}

/**
 * Filtering and sorting shared by the alert list and a problem's alert
 * list, which take the same `AlertListParams` in Nexus.
 */
export function filterAlerts(
  alerts: Json<Api.Alert>[],
  query: Pick<Api.AlertListQueryParams, 'startTime' | 'endTime' | 'alertClass' | 'sortBy'>
) {
  const { startTime, endTime, alertClass } = query
  let final = alerts.filter((d) => d.class !== 'probe')

  if (startTime) final = final.filter((alert) => new Date(alert.time_created) >= startTime)
  if (endTime) final = final.filter((alert) => new Date(alert.time_created) <= endTime)
  if (alertClass) {
    // Nexus parses the param as a subscription, which 400s on probe,
    // malformed values, and unrecognized exact classes
    // https://github.com/oxidecomputer/omicron/blob/7e18e52/nexus/db-model/src/alert_subscription.rs#L62-L98
    if (alertClass === 'probe')
      throw invalidRequest(
        `unsupported value for "alert_class": the 'probe' alert class is a synthetic alert used only for webhook liveness probes, and is not included in alert lists and cannot be subscribed to`
      )
    const matcher = subscriptionRegex(alertClass)
    if (
      !matcher ||
      (!isGlobPattern(alertClass) && !alertClasses.some((c) => c.name === alertClass))
    ) {
      throw invalidRequest(`'${alertClass}' is not a valid alert class`)
    }
    // a well-formed glob matching no classes is a 404
    // https://github.com/oxidecomputer/omicron/blob/7e18e52/nexus/db-queries/src/db/datastore/alert.rs#L261-L272
    if (!alertClasses.filter(isSubscribableClass).some((c) => matcher.test(c.name))) {
      throw notFoundErr(
        `alert class glob '${alertClass}' does not match any existing alert classes`
      )
    }

    final = final.filter((alert) => matcher.test(alert.class))
  }

  return match(query.sortBy)
    .with(undefined, () => final)
    .with('time_and_id_descending', () =>
      R.reverse(R.sortBy(final, ({ time_created, id }) => `${time_created}|${id}`))
    )
    .with('time_and_id_ascending', () =>
      R.sortBy(final, ({ time_created, id }) => `${time_created}|${id}`)
    )
    .exhaustive()
}

/** How long a pending delivery waits before its next attempt */
const RETRY_DELAY_MS = 5000
/** After this many failed attempts the delivery fails permanently */
const MAX_ATTEMPTS = 3

/** When each pending delivery, by ID, makes its next attempt */
const nextAttemptAt = new Map<string, number>()

/**
 * In the real system the deliverator RPW retries pending deliveries in the
 * background, so pending is a transient state. Stand in for that by making one
 * more attempt whenever the list is fetched after the retry delay has passed.
 * State transitions match
 * https://github.com/oxidecomputer/omicron/blob/32615a35/nexus/db-queries/src/db/datastore/webhook_delivery.rs#L449-L473
 */
export function retryPendingDeliveries(receiver: Json<Api.AlertReceiver>) {
  const now = Date.now()
  // same sentinel as the liveness probe: endpoints we can't reach keep failing
  const success = !receiver.kind.endpoint.includes('unreachable')

  for (const delivery of db.alertDeliveries) {
    if (delivery.receiver_id !== receiver.id || delivery.state !== 'pending') continue

    const dueAt = nextAttemptAt.get(delivery.id)
    if (dueAt === undefined) {
      nextAttemptAt.set(delivery.id, now + RETRY_DELAY_MS)
      continue
    }
    if (now < dueAt) continue

    const attempt = delivery.attempts.webhook.length + 1
    delivery.attempts.webhook.push({
      attempt,
      result: success ? 'succeeded' : 'failed_unreachable',
      response: success ? { status: 200, duration_ms: 137 } : null,
      time_sent: new Date().toISOString(),
    })
    delivery.state = success ? 'delivered' : attempt >= MAX_ATTEMPTS ? 'failed' : 'pending'

    if (delivery.state === 'pending') {
      nextAttemptAt.set(delivery.id, now + RETRY_DELAY_MS)
    } else {
      nextAttemptAt.delete(delivery.id)
    }
  }
}

/**
 * Alerts eligible for resend to this receiver: it has a delivery for the alert
 * and no non-probe delivery of that alert has left the failed state. Note this
 * is per alert, not per delivery: delivery records are immutable history, so a
 * failed one stays failed and a resend inserts a new record. A resend record
 * starts out pending, which takes the alert out of this set right away, and if
 * it succeeds the alert never comes back. That is what drains the backlog.
 * https://github.com/oxidecomputer/omicron/blob/6db4c7e/nexus/db-queries/src/db/datastore/webhook_delivery.rs#L205-L240
 *
 * Returns one delivery per alert so callers can read the alert class off it.
 * The console previews this count with `resendableAlertIds` (app/api/util.ts),
 * which applies the same rule to camelCase records.
 *
 * Omicron's NOT EXISTS subquery filters on alert_id, state, and triggered_by
 * but not rx_id, so upstream a success on one receiver makes the alert
 * non-resendable for every receiver. We scope per receiver, which is what the
 * API docs describe.
 */
export function resendableAlerts(receiver: Json<Api.AlertReceiver>) {
  const forRx = db.alertDeliveries.filter(
    (d) => d.receiver_id === receiver.id && d.alert_class !== 'probe'
  )
  const settled = new Set(
    forRx
      .filter((d) => d.trigger !== 'probe' && d.state !== 'failed')
      .map((d) => d.alert_id)
  )
  return R.uniqueBy(forRx, (d) => d.alert_id).filter((d) => !settled.has(d.alert_id))
}
