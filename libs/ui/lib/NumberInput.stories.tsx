/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { NumberInput } from './NumberInput'

export const Default = () => (
  <div className="max-w-lg">
    <NumberInput defaultValue={6} />
  </div>
)

export const WithUnit = () => (
  <div className="max-w-lg">
    <NumberInput
      defaultValue={6}
      formatOptions={{
        style: 'unit',
        unit: 'inch',
        unitDisplay: 'long',
      }}
    />
  </div>
)

export const StepValues = () => (
  <div className="max-w-lg space-y-4 text-sans-md children:space-y-2">
    <div>
      <div>Step</div>
      <NumberInput step={10} />
    </div>
    <div>
      <div>Step + minValue</div>
      <NumberInput minValue={2} step={2} />
    </div>
    <div>
      <div>Step + minValue + maxValue</div>
      <NumberInput minValue={2} maxValue={20} step={2} />
    </div>
  </div>
)
