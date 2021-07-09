import React, { useState } from 'react'
import cn from 'classnames'

import useInterval from '../hooks/use-interval'

const FRAMES = ['|', '/', '—', '\\']

type Props = { className?: string }

export default ({ className }: Props) => {
  const [index, setIndex] = useState(0)

  useInterval(() => {
    setIndex((index + 1) % FRAMES.length)
  }, 150)

  return (
    <span className={cn('font-mono text-green-500', className)}>
      {FRAMES[index]}
    </span>
  )
}
