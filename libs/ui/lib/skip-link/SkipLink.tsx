import type { PropsWithChildren } from 'react'

import cn from 'classnames'

const skipLinkStyles = `
    absolute -top-10 z-10 p-2
    w-full uppercase text-mono-lg
    inline-flex items-center justify-center 
    focus:ring-2 focus:ring-accent-secondary 
    bg-accent border-transparent text-inverse
    transition-all motion-reduce:transform-none
`

export type SkipLinkProps = PropsWithChildren<{
  id: string
  target?: string
  className?: string
}>
export const SkipLink = ({
  id,
  target = 'content',
  children = 'Skip to content',
  className,
}: SkipLinkProps) => {
  return (
    <a id={id} href={`#${target}`} className={cn(skipLinkStyles, 'focus:top-0', className)}>
      {children}
    </a>
  )
}

export const SkipLinkTarget = ({ id = 'content' }) => {
  return <div id={id} className="h-0" />
}
