/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, test } from 'vitest'

import { readBlobAsBase64 } from './file'

describe('readBlobAsBase64', async () => {
  test('works with zeros', async () => {
    const blob = new Blob([Buffer.alloc(10)])
    const text = await readBlobAsBase64(blob)
    expect(text).toEqual('AAAAAAAAAAAAAA==')
  })

  test('works with other stuff', async () => {
    const original = 'abcdef'.repeat(100)
    const blob = new Blob([Buffer.from(original)])
    const text = await readBlobAsBase64(blob)
    expect(btoa(original)).toEqual(text)
    expect(atob(text)).toEqual(original)
  })
})
