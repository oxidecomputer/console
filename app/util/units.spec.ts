/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, it } from 'vitest'

import { bytesToRationalNumber } from './units'

function bytesToRationalNumberTest() {
  // the basics
  expect(bytesToRationalNumber(1024)).toEqual({ number: 1, unit: 'KiB' })
  expect(bytesToRationalNumber(1048576)).toEqual({ number: 1, unit: 'MiB' })
  expect(bytesToRationalNumber(1073741824)).toEqual({ number: 1, unit: 'GiB' })
  expect(bytesToRationalNumber(1099511627776)).toEqual({ number: 1, unit: 'TiB' })

  // double those
  expect(bytesToRationalNumber(2048)).toEqual({ number: 2, unit: 'KiB' })
  expect(bytesToRationalNumber(2097152)).toEqual({ number: 2, unit: 'MiB' })
  expect(bytesToRationalNumber(2147483648)).toEqual({ number: 2, unit: 'GiB' })
  expect(bytesToRationalNumber(2199023255552)).toEqual({ number: 2, unit: 'TiB' })

  // just 1.5 now
  expect(bytesToRationalNumber(1536)).toEqual({ number: 1.5, unit: 'KiB' })
  expect(bytesToRationalNumber(1572864)).toEqual({ number: 1.5, unit: 'MiB' })
  expect(bytesToRationalNumber(1610612736)).toEqual({ number: 1.5, unit: 'GiB' })
  expect(bytesToRationalNumber(1649267441664)).toEqual({ number: 1.5, unit: 'TiB' })

  // let's do two decimal places (1.75)
  expect(bytesToRationalNumber(1792)).toEqual({ number: 1.75, unit: 'KiB' })
  expect(bytesToRationalNumber(1835008)).toEqual({ number: 1.75, unit: 'MiB' })
  expect(bytesToRationalNumber(1879048192)).toEqual({ number: 1.75, unit: 'GiB' })
  expect(bytesToRationalNumber(1924145348608)).toEqual({ number: 1.75, unit: 'TiB' })

  // and three decimal places (1.755)
  expect(bytesToRationalNumber(1797.12, 3)).toEqual({ number: 1.755, unit: 'KiB' })
  expect(bytesToRationalNumber(1840250.88, 3)).toEqual({ number: 1.755, unit: 'MiB' })
  expect(bytesToRationalNumber(1884416901.12, 3)).toEqual({ number: 1.755, unit: 'GiB' })
  expect(bytesToRationalNumber(1929642906746.88, 3)).toEqual({
    number: 1.755,
    unit: 'TiB',
  })

  // but if we only want two decimal places, it should round appropriately
  // note the missing second argument, so we'll used the default decimal value, 2
  expect(bytesToRationalNumber(1797.12)).toEqual({ number: 1.76, unit: 'KiB' })
  expect(bytesToRationalNumber(1840250.88)).toEqual({ number: 1.76, unit: 'MiB' })
  expect(bytesToRationalNumber(1884416901.12)).toEqual({ number: 1.76, unit: 'GiB' })
  expect(bytesToRationalNumber(1929642906746.88)).toEqual({
    number: 1.76,
    unit: 'TiB',
  })
}

it('rounds to a rational number', bytesToRationalNumberTest)
