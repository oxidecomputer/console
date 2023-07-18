/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Globals } from '@react-spring/web'
import { useEffect, useState } from 'react'

Globals.assign({ skipAnimation: true })

const motionQuery = () => window.matchMedia('(prefers-reduced-motion: reduce)')

/**
 * Pulled from [react-reduce-motion](https://github.com/infiniteluke/react-reduce-motion).
 */
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(motionQuery().matches)
  useEffect(() => {
    const mq = motionQuery()
    const handleChange = () => setReducedMotion(mq.matches)
    handleChange()
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])
  return reducedMotion
}

export function ReduceMotion() {
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    Globals.assign({ skipAnimation: prefersReducedMotion })
  }, [prefersReducedMotion])

  return null
}
