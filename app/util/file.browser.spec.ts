/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { afterEach, describe, expect, test, vi } from 'vitest'

import { readBlobAsBase64 } from './file'

describe('readBlobAsBase64', () => {
  afterEach(() => vi.restoreAllMocks())

  test('rejects when the file cannot be read', async () => {
    const error = new DOMException('The file could not be read', 'NotReadableError')
    vi.spyOn(FileReader.prototype, 'error', 'get').mockReturnValue(error)
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (
      this: FileReader
    ) {
      queueMicrotask(() => this.dispatchEvent(new ProgressEvent('error')))
    })

    await expect(readBlobAsBase64(new Blob(['image chunk']))).rejects.toBe(error)
  })

  test('rejects when reading is aborted', async () => {
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (
      this: FileReader
    ) {
      queueMicrotask(() => this.dispatchEvent(new ProgressEvent('abort')))
    })

    await expect(readBlobAsBase64(new Blob(['image chunk']))).rejects.toMatchObject({
      name: 'AbortError',
    })
  })

  test('works with zeros', async () => {
    const blob = new Blob([new Uint8Array(10)])
    const text = await readBlobAsBase64(blob)
    expect(text).toEqual('AAAAAAAAAAAAAA==')
  })

  test('works with other stuff', async () => {
    const original = 'abcdef'.repeat(100)
    const blob = new Blob([new TextEncoder().encode(original)])
    const text = await readBlobAsBase64(blob)
    expect(btoa(original)).toEqual(text)
    expect(atob(text)).toEqual(original)
  })
})
