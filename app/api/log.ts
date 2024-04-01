/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { isTruthy } from '~/util/array'

import { type ErrorResult } from './__generated__/Api'

export const LOG_KEY = 'OXIDE_API_LOG'

type LogItem = ErrorResult & {
  timestamp: Date
}

// TODO: change back to sessionStorage/figure out how to make it work in
// local dev

export function clearLog() {
  localStorage.removeItem(LOG_KEY)
}

export function addToLog(error: unknown) {
  const rawLog = localStorage.getItem(LOG_KEY)
  const log = rawLog ? (JSON.parse(rawLog) as unknown[]) : []
  // TODO: add timestamp
  log.push(error)
  // TODO: max N
  localStorage.setItem(LOG_KEY, JSON.stringify(log))
}

function parseItem(obj: unknown): LogItem | null {
  if (!obj) return null
  if (typeof obj !== 'object') return null
  if (!('type' in obj)) return null

  // TODO: uh obviously check more stuff

  if ('timestamp' in obj && typeof obj.timestamp === 'string') {
    obj.timestamp = new Date(obj.timestamp)
  }
  return obj as LogItem
}

export function getLog(): LogItem[] {
  const rawLog = localStorage.getItem(LOG_KEY)
  if (!rawLog) return []
  const logJson = JSON.parse(rawLog)
  if (!Array.isArray(logJson)) {
    clearLog()
    return []
  }

  return logJson.map(parseItem).filter(isTruthy)
}
