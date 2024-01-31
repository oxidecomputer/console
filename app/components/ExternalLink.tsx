/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'

type ExternalLinkProps = {
  href: string
  className?: string
  children: React.ReactNode
}

export function ExternalLink({ href, className, children }: ExternalLinkProps) {
  return (
    <a
      href={href}
      className={cn('underline text-accent-secondary hover:text-accent', className)}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  )
}
