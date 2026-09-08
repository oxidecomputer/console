/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { NumberField } from './NumberField'

function NumberFieldHarness({ units }: { units?: string }) {
  const { control } = useForm({ defaultValues: { size: 9 } })
  return <NumberField name="size" label="Size" control={control} units={units} />
}

test.each([undefined, 'GiB'])(
  'stepper names match the field label with units %s',
  async (units) => {
    const screen = await render(<NumberFieldHarness units={units} />)
    const label = units ? 'Size (GiB)' : 'Size'

    await expect
      .element(screen.getByRole('textbox', { name: label, exact: true }))
      .toBeVisible()
    await expect
      .element(screen.getByRole('button', { name: `Increase ${label}`, exact: true }))
      .toBeVisible()
    await expect
      .element(screen.getByRole('button', { name: `Decrease ${label}`, exact: true }))
      .toBeVisible()
  }
)
