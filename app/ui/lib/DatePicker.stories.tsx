/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { getLocalTimeZone, now, today } from '@internationalized/date'

import { DatePicker } from './DatePicker'
import { DateRangePicker } from './DateRangePicker'

export function Default() {
  return (
    <div className="flex flex-col space-y-4">
      <div>
        <DateRangePicker
          label="Label"
          minValue={today(getLocalTimeZone())}
          defaultValue={{
            start: now(getLocalTimeZone()),
            end: now(getLocalTimeZone()).add({ weeks: 1 }),
          }}
          hideTimeZone
          hourCycle={24}
        />
      </div>
      <div>
        <DatePicker
          label="Label"
          minValue={today(getLocalTimeZone())}
          defaultValue={now(getLocalTimeZone())}
          hideTimeZone
          hourCycle={24}
        />
      </div>
    </div>
  )
}
