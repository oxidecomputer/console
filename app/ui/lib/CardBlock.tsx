/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { type ReactNode } from 'react'

import { OpenLink12Icon } from '@oxide/design-system/icons/react'

import { classed } from '~/util/classed'

type Width = 'medium' | 'full'

const widthClass: Record<Width, string> = {
  medium: 'w-full max-w-[740px]',
  full: 'w-full',
}

export type CardBlockProps = {
  children: ReactNode
  width?: Width
}

export function CardBlock({ children, width = 'full' }: CardBlockProps) {
  return (
    <div
      className={cn(
        'text-sans-md border-default *:border-b-secondary bg-default flex flex-col rounded-lg border py-5 *:border-b *:last:border-0 *:last:pb-0',
        widthClass[width]
      )}
    >
      {children}
    </div>
  )
}

type HeaderProps = {
  title: string
  description?: ReactNode
  children?: ReactNode
  titleId?: string
}

CardBlock.Header = ({ title, description, children, titleId }: HeaderProps) => (
  <header className="text-secondary flex items-start justify-between px-5 pb-4">
    <div className="flex flex-col gap-0.5">
      <div className="text-sans-semi-lg text-raise" id={titleId}>
        {title}
      </div>
      {description && <div className="text-secondary">{description}</div>}
    </div>

    <div className="space-x-2">{children}</div>
  </header>
)

// If there's a table with a scrollbar we want to avoid it adding extra padding at the bottom
CardBlock.Body = classed.div`px-5 py-4 space-y-4 [&>*:last-child[data-simplebar]]:pb-3 [&>*:last-child[data-simplebar]]:-mb-3`

CardBlock.Footer = classed.footer`flex items-center justify-between px-5 pt-4 text-secondary`

export const LearnMore = ({ href, text }: { href: string; text: React.ReactNode }) => (
  <div className="text-sans-md">
    Learn more about{' '}
    <a
      href={href}
      className="text-accent-secondary hover:text-accent inline-flex items-center"
      target="_blank"
      rel="noreferrer"
    >
      {text}
      <OpenLink12Icon className="ml-1 align-middle" />
    </a>
  </div>
)
