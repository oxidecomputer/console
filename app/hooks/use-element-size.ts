/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState, useRef, useCallback, type RefCallback } from 'react'

type Size = { width: number; height: number } | null

export function useElementSize(): [Size, RefCallback<HTMLElement>] {
  const [size, setSize] = useState<Size>(null)
  const observer = useRef<ResizeObserver>(null)

  const ref = useCallback((element: HTMLElement | null) => {
    observer.current?.disconnect()
    if (!element) return

    observer.current = new ResizeObserver(([first]: ResizeObserverEntry[]) => {
      setSize({
        width: first.contentBoxSize[0].inlineSize,
        height: first.contentBoxSize[0].blockSize,
      })
    })
    observer.current.observe(element)
  }, [])

  return [size, ref]
}
