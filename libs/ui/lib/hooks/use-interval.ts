/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useRef } from 'react'

interface UseIntervalProps {
  fn: () => void
  delay: number | null | undefined
  /** Use to force a render because changes to the callback won't */
  key?: string
}

/**
 * Fire `fn` on an interval. Does not fire immediately, only after `delay`.
 *
 * Use null `delay` to prevent the interval from firing at all. Change `key` to
 * force a render, which cleans up the currently set interval and possibly sets
 * a new one.
 */
export default function useInterval({ fn, delay, key }: UseIntervalProps) {
  const callbackRef = useRef<() => void>()

  useEffect(() => {
    callbackRef.current = fn
  }, [fn])

  useEffect(() => {
    if (delay === null || delay === undefined) return
    const intervalId = setInterval(() => callbackRef.current?.(), delay)
    return () => clearInterval(intervalId)
  }, [delay, key])
}
