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

type Width = 'medium' | 'fullWidth'

const widthClass: Record<Width, string> = {
  medium: 'w-full max-w-[740px]',
  fullWidth: 'w-full',
}

export type CardBlockProps = {
  children: ReactNode
  width?: Width
}

export function CardBlock({ children, width = 'fullWidth' }: CardBlockProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border py-5 text-sans-md border-default',
        widthClass[width]
      )}
    >
      {children}
    </div>
  )
}

CardBlock.Header = ({
  title,
  description,
  children,
}: {
  title: string
  description?: ReactNode
  children?: ReactNode
}) => (
  <header className="flex items-start justify-between border-b px-5 pb-4 text-secondary border-secondary">
    <div className="flex flex-col gap-0.5">
      <div className="text-sans-semi-lg text-raise">{title}</div>
      {description && <div className="text-secondary">{description}</div>}
    </div>

    <div className="space-x-2">{children}</div>
  </header>
)

// If there's a table with a scrollbar we want to avoid it adding extra padding at the bottom
CardBlock.Body = classed.div`px-5 pt-4 space-y-4 [&>*:last-child[data-simplebar]]:pb-3 [&>*:last-child[data-simplebar]]:-mb-3`
CardBlock.Footer = ({
  text,
  href,
  children,
}: {
  text: string
  href: string
  children?: ReactNode
}) => (
  <footer className="flex items-center justify-between border-t px-5 pt-4 text-secondary border-secondary">
    <LearnMore href={href} text={text} />
    {children}
  </footer>
)

export const LearnMore = ({ href, text }: { href: string; text: React.ReactNode }) => (
  <div className="text-sans-md">
    Learn more about{' '}
    <a
      href={href}
      className="inline-flex items-center text-accent-secondary hover:text-accent"
      target="_blank"
      rel="noreferrer"
    >
      {text}
      <OpenLink12Icon className="ml-1 align-middle" />
    </a>
  </div>
)
