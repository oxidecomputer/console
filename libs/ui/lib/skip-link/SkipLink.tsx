import cn from 'classnames'
import React from 'react'

const skipLinkStyles = `
    absolute -top-10 z-10 p-1
    w-full uppercase font-mono 
    inline-flex items-center justify-center 
    focus:ring-2 focus:ring-green-700 
    bg-green-500 border-transparent text-black 
    transition-all motion-reduce:transform-none
`

interface SkipLinkProps {
  id: string
  target?: string
  text?: string
}

export const SkipLink = ({
  id,
  target = 'content',
  text = 'Skip to content',
}: SkipLinkProps) => {
  return (
    <a
      id={id}
      href={`#${target}`}
      className={cn(skipLinkStyles, 'focus:top-0')}
    >
      {text}
    </a>
  )
}

export const SkipLinkTarget = ({ id = 'content' }) => {
  return <div id={id} />
}
