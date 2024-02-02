/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { camelCaseToWords, capitalize } from '@oxide/util'

import type { ErrorResult } from './__generated__/Api'

/**
 * Processed API error ready for display in the console. Note that it's possible
 * to get an `ApiError` even on a successful request if, for example, we fail to
 * parse the response body.
 */
export type ApiError = {
  message: string
  errorCode?: string
  statusCode?: number
}

/**
 * If we can pull the resource name out of the error message, do that, otherwise
 * fall back to using the API method name. The reason we prefer the error
 * message is that instance create also creates a disk, and when the disk is the
 * thing that already exists, the message says "disk" but the method says
 * "instance". We could use the API's message directly, but it includes the
 * name, which can be long, and we have it in the form field already.
 */
export function getResourceName(method: string, message: string) {
  const match = /^already exists: ([^"]+)/.exec(message)
  if (match) return match[1].trim()

  const words = camelCaseToWords(method)
  const i = words.indexOf('create')
  if (i < 1) return null
  return words[i - 1].replace(/s$/, '')
}

export function processServerError(method: string, resp: ErrorResult): ApiError {
  // client error is a JSON parse or processing error and is highly unlikely to
  // be end-user readable
  if (resp.type === 'client_error') {
    // nice to log but don't clutter test output
    if (process.env.NODE_ENV !== 'test') console.error(resp)
    return {
      message: 'Error reading API response',
      statusCode: resp.statusCode,
    }
  }

  let message: string | undefined = undefined
  const code = resp.data.errorCode

  if (code === 'Forbidden') {
    message = 'Action not authorized'
  } else if (code === 'ObjectNotFound') {
    message = capitalize(resp.data.message)
  } else if (code === 'ObjectAlreadyExists') {
    const resource = getResourceName(method, resp.data.message)
    if (resource) {
      message = `${capitalize(resource)} name already exists`
    }
  }

  // fall back to raw server error message if present. parse errors have no
  // error code, for some reason
  if (!message) {
    message =
      getParseError(resp.data.message) ||
      capitalize(resp.data.message) ||
      'Unknown server error'
  }

  return {
    message,
    errorCode: resp.data.errorCode || undefined,
    statusCode: resp.statusCode,
  }
}

export function getParseError(message: string | undefined): string | undefined {
  if (!message) return undefined
  const inner = /^unable to parse JSON body: (.+) at line \d+ column \d+$/.exec(
    message
  )?.[1]
  return inner && capitalize(inner)
}
