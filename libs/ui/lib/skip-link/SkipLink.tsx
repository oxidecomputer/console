import cn from 'classnames'
import React, { useEffect, useState } from 'react'

const skipLinkStyles = `
    absolute -top-10 z-10 p-1
    w-full border rounded uppercase font-mono 
    inline-flex items-center justify-center 
    align-top focus:ring-2 focus:ring-green-700 
    bg-green-500 border-transparent text-black 
    hover:bg-green-600 transition-all motion-reduce:transform-none
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
  const [href, setHref] = useState(`${location.pathname}#${target}`)

  useEffect(() => {
    const listener = () => setHref(`${location.pathname}#${target}`)
    window.addEventListener('popstate', listener)
    return () => window.removeEventListener('popstate', listener)
  }, [target])

  return (
    <a id={id} href={href} className={cn(skipLinkStyles, 'focus:top-0')}>
      {text}
    </a>
  )
}

export const SkipLinkTarget = ({ id = 'content' }) => {
  return <div id={id} />
}
