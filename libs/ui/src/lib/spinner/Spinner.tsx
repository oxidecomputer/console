import React, { useState } from 'react'
import 'twin.macro'

import useInterval from '../hooks/use-interval'

const FRAMES = ['|', '/', '—', '\\']

type Props = { className?: string }

export default ({ className }: Props) => {
  const [index, setIndex] = useState(0)

  useInterval(() => {
    setIndex((index + 1) % FRAMES.length)
  }, 150)

  return (
    <span tw="font-mono text-green" className={className}>
      {FRAMES[index]}
    </span>
  )
}
