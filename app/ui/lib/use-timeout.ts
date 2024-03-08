/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useRef } from 'react'

// use null delay to prevent the timeout from firing
export function useTimeout(callback: () => void, delay: number | null) {
  const callbackRef = useRef<() => void>()

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return
    const intervalId = setTimeout(() => callbackRef.current?.(), delay)
    return () => clearTimeout(intervalId)
  }, [delay])
}
