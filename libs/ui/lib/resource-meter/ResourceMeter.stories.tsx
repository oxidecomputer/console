/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { ResourceMeter } from './ResourceMeter'

export const Default = () => (
  <div className="flex flex-col gap-2">
    <p>
      ResourceMeter shows the “percent used” of a resource relative to a “total” amount
      (100%).
    </p>
    <div className="grid grid-cols-[20px,1fr] gap-2">
      <ResourceMeter value={20} />
      <p>
        When there’s a lot of spare capacity (the value is a low percentage of the total
        available), the ResourceMeter is green.
      </p>

      <ResourceMeter value={55} />
      <p>When elevated, it’s yellow.</p>

      <ResourceMeter value={76} />
      <p>When very high, it’s red.</p>
    </div>
    <p>Thresholds for the “warning” and “error” levels can be passed in as props.</p>
  </div>
)
