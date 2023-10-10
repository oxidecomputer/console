/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/** async wrapper for reading a slice of a file */
export async function readBlobAsBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const fileReader = new FileReader()

    // split on comma and pop because data URL looks like
    // 'data:[<mediatype>][;base64],<data>' and we only want <data>.
    // e.target is never null and result is always a string
    fileReader.onload = function (e) {
      const base64Chunk = (e.target!.result as string).split(',').pop()!
      resolve(base64Chunk)
    }

    fileReader.readAsDataURL(blob)
  })
}

/** async wrapper for reading a file as text */
export async function readBlobAsText(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const fileReader = new FileReader()

    // split on comma and pop because data URL looks like
    // 'data:[<mediatype>][;base64],<data>' and we only want <data>.
    // e.target is never null and result is always a string
    fileReader.onload = function (e) {
      const base64Chunk = (e.target!.result as string).split(',').pop()!
      resolve(base64Chunk)
    }

    fileReader.readAsText(blob)
  })
}
