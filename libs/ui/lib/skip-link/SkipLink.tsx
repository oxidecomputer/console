/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import type { PropsWithChildren } from 'react'

const skipLinkStyles = `
    absolute left-1/2 -translate-x-1/2 -top-10 z-10 px-3 py-2
    uppercase text-mono-lg rounded
    inline-flex items-center justify-center
    focus:ring-2 focus:ring-accent-secondary
    bg-accent-secondary border-transparent text-accent text-mono-sm
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
    <a id={id} href={`#${target}`} className={cn(skipLinkStyles, 'focus:top-2', className)}>
      {children}
    </a>
  )
}

export const SkipLinkTarget = ({ id = 'content' }) => {
  return <div id={id} className="h-0" />
}
