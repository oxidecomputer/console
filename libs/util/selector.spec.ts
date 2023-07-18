/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { assertType, describe, expect, it } from 'vitest'

import { toPathQuery } from './selector'

describe('toPathQuery', () => {
  it('works in the base case', () => {
    const result = toPathQuery('instance', {
      instance: 'i',
      project: 'p',
    })
    expect(result).toEqual({
      path: { instance: 'i' },
      query: { project: 'p' },
    })

    // with nice type inference
    assertType<{
      path: { instance: string }
      query: { project: string }
    }>(result)
  })

  it('leaves an empty query in there when there is only the one key', () => {
    expect(toPathQuery('instance', { instance: 'i' })).toEqual({
      path: { instance: 'i' },
      query: {},
    })
  })

  it('type errors on missing key', () => {
    // type error if key is not in the object
    // @ts-expect-error
    toPathQuery('instance', { instanc: 'i', project: 'p' })
  })
})
