/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { toLocaleDateString, toLocaleTimeString } from '~/util/date'

export const DateTime = ({ date, locale }: { date: Date; locale?: string }) => (
  <time dateTime={date.toISOString()} className="flex flex-wrap gap-x-2">
    <span>{toLocaleDateString(date, locale)}</span>
    <span className="text-tertiary">{toLocaleTimeString(date, locale)}</span>
  </time>
)
