import { getLocalTimeZone, now, today } from '@internationalized/date'

import { DatePicker } from './DatePicker'
import { DateRangePicker } from './DateRangePicker'
import { RelativeDateRangePicker } from './RelativeDateRangePicker'

export function Default() {
  return (
    <div className="flex flex-col space-y-4">
      <div>
        <RelativeDateRangePicker
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
