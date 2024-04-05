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

export type LogItem = ErrorResult & {
  path: string
  timestamp: Date
}

// TODO: this can't really go in localStorage, it needs to die on session expiration.
// but sessionStorage isn't really good enough

export function clearLog() {
  localStorage.removeItem(LOG_KEY)
}

const MAX_ITEMS = 100

export function logError(error: ErrorResult) {
  console.log(error)
  const log = getLog().slice(0, MAX_ITEMS - 1)
  const { pathname, search } = window.location
  const path = pathname + search
  log.unshift({ path, timestamp: new Date(), ...error })
  localStorage.setItem(LOG_KEY, JSON.stringify(log))
}

function parseItem(obj: unknown): LogItem | null {
  if (!obj) return null
  if (typeof obj !== 'object') return null
  if (!('type' in obj && typeof obj.type === 'string')) return null
  if (!('path' in obj && typeof obj.path === 'string')) return null
  if (!('timestamp' in obj && typeof obj.timestamp === 'string')) return null

  // TODO: uh obviously check more stuff
  obj.timestamp = new Date(obj.timestamp)
  return obj as LogItem
}

/** Get log, filtering out unparseable entries */
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
