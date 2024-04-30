/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { autoUpdate, offset, useFloating } from '@floating-ui/react'
import { Popover } from '@headlessui/react'
import cn from 'classnames'

import { OpenLink12Icon, Question12Icon } from '@oxide/design-system/icons/react'

import { buttonStyle } from '~/ui/lib/Button'

import { ExternalLink } from './ExternalLink'

type DocsPopoverLinkProps = {
  href: string
  linkText: string
}

export const DocsPopoverLink = ({ href, linkText }: DocsPopoverLinkProps) => (
  <ExternalLink
    href={href}
    className="group block px-4 no-underline children:last:border-0"
  >
    <div className="mx-2 border-b py-2 border-secondary">
      <div className="relative -ml-2 inline-block rounded py-1 pl-2 pr-7 text-sans-md !text-default group-hover:bg-tertiary">
        <span className="inline-block max-w-[300px] truncate align-middle">{linkText}</span>
        <OpenLink12Icon className="absolute top-1.5 ml-2 translate-y-[1px] text-tertiary" />
      </div>
    </div>
  </ExternalLink>
)

type DocsPopoverProps = {
  heading: React.ReactNode
  icon: JSX.Element
  links: Array<DocsPopoverLinkProps>
  summary: string
}

export const DocsPopover = ({ heading, icon, summary, links }: DocsPopoverProps) => {
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-end',
    middleware: [offset(12)],
    whileElementsMounted: autoUpdate,
  })
  return (
    <Popover>
      <Popover.Button
        ref={refs.setReference}
        className={cn(buttonStyle({ size: 'sm', variant: 'ghost' }), 'w-9')}
      >
        <Question12Icon aria-label="Links to docs" className="shrink-0" />
      </Popover.Button>
      <Popover.Panel
        className="z-10 w-96 rounded-lg border bg-raise border-secondary elevation-1"
        ref={refs.setFloating}
        style={floatingStyles}
      >
        <div className="px-4">
          <h2 className="mt-4 flex items-center gap-1 text-sans-md">
            <div className="mr-1 flex items-center text-accent-secondary">{icon}</div>
            <span className="text-tertiary">Learn:</span>
            {heading}
          </h2>
          <p className="mb-3 mt-2 text-sans-md text-secondary">{summary}</p>
        </div>
        <div className="border-t pb-1 border-secondary">
          <h3 className="mb-1 mt-3 px-4 text-mono-sm text-quaternary">Guides</h3>
          {links.map((link) => (
            <DocsPopoverLink key={link.href} {...link} />
          ))}
        </div>
      </Popover.Panel>
    </Popover>
  )
}
