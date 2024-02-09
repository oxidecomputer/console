/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { formatDistanceToNowStrict, type FormatDistanceToNowStrictOptions } from 'date-fns'

// locale setup and formatDistance function copied from here and modified
// https://github.com/date-fns/date-fns/blob/56a3856/src/locale/en-US/_lib/formatDistance/index.js

const formatDistanceLocale = {
  lessThanXSeconds: '< {{count}}s',
  xSeconds: '{{count}}s',
  halfAMinute: '30s',
  lessThanXMinutes: '< {{count}}m',
  xMinutes: '{{count}}m',
  aboutXHours: '~ {{count}}h',
  xHours: '{{count}}h',
  xDays: '{{count}}d',
  aboutXWeeks: '~ {{count}}w',
  xWeeks: '{{count}}w',
  aboutXMonths: '~ {{count}}mo',
  xMonths: '{{count}}mo',
  aboutXYears: '~ {{count}}y',
  xYears: '{{count}}y',
  overXYears: '> {{count}}y',
  almostXYears: '~ {{count}}y',
}

export const timeAgoAbbr = (d: Date, options?: FormatDistanceToNowStrictOptions) =>
  formatDistanceToNowStrict(d, {
    ...options,
    locale: {
      formatDistance: (token, count, options) => {
        const result = formatDistanceLocale[token]?.replace('{{count}}', count.toString())
        if (result && options?.addSuffix) {
          return result + ' ago'
        }
        return result
      },
    },
  })
