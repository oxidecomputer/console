/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Tooltip } from '~/ui/lib/Tooltip'
import {
  toLocaleDateString,
  toLocaleTimeString,
  toSyslogDateString,
  toSyslogTimeString,
} from '~/util/date'

export const DateTime = ({ date, locale }: { date: Date; locale?: string }) => (
  <time dateTime={date.toISOString()} className="flex gap-x-1">
    <span>{toLocaleDateString(date, locale)}</span>
    <span className="text-tertiary">{toLocaleTimeString(date, locale)}</span>
  </time>
)

/**
 * Compact log-style timestamp like `Jan 21 23:33:45`, mono, with the date
 * dimmed. The display is local time with no year or zone, so the full UTC
 * timestamp is in a tooltip for correlating with logs from other systems.
 */
export const SyslogDateTime = ({ date, locale }: { date: Date; locale?: string }) => (
  <Tooltip content={date.toISOString()} placement="top">
    <time dateTime={date.toISOString()} className="text-mono-sm whitespace-nowrap">
      <span className="text-tertiary">{toSyslogDateString(date, locale)}</span>{' '}
      {toSyslogTimeString(date, locale)}
    </time>
  </Tooltip>
)
