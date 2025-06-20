/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import cn from 'classnames'
import type { JSX } from 'react'

import { Info16Icon, OpenLink12Icon } from '@oxide/design-system/icons/react'

import { buttonStyle } from '~/ui/lib/Button'

type DocsPopoverLinkProps = {
  href: string
  linkText: string
}

export const DocsPopoverLink = ({ href, linkText }: DocsPopoverLinkProps) => (
  <a
    href={href}
    className="group block px-4 children:last:border-0"
    target="_blank"
    rel="noreferrer"
  >
    <div className="mx-2 border-b py-1.5 border-secondary">
      <div className="relative -ml-2 inline-block rounded py-1 pl-2 pr-7 text-sans-md text-raise group-hover:bg-tertiary">
        <span className="inline-block max-w-[300px] truncate align-middle">{linkText}</span>
        <OpenLink12Icon className="absolute top-1.5 ml-2 translate-y-[1px] text-secondary" />
      </div>
    </div>
  </a>
)

type DocsPopoverProps = {
  /** Lower case because it appears as "Learn about ..." */
  heading: string
  icon: JSX.Element
  links: Array<DocsPopoverLinkProps>
  summary: string
}

export const DocsPopover = ({ heading, icon, summary, links }: DocsPopoverProps) => {
  const title = `Learn about ${heading}`
  return (
    <Popover>
      <PopoverButton title={title}>
        <div className={cn(buttonStyle({ size: 'sm', variant: 'ghost' }), 'w-8')}>
          <Info16Icon aria-hidden className="shrink-0" />
        </div>
      </PopoverButton>
      <PopoverPanel
        // popover-panel needed for enter animation
        className="popover-panel z-10 w-96 rounded-lg border bg-raise border-secondary elevation-2"
        anchor={{ to: 'bottom end', gap: 12 }}
      >
        <div className="px-4">
          <h2 className="mt-4 flex items-center gap-1 text-sans-md">
            <div className="mr-1 flex items-center text-accent-secondary">{icon}</div>
            {title}
          </h2>
          <p className="mb-3 mt-2 text-sans-md text-default">{summary}</p>
        </div>
        <div className="border-t pb-1 border-secondary">
          <h3 className="mb-1 mt-3 px-4 text-mono-sm text-tertiary">Guides</h3>
          {links.map((link) => (
            <DocsPopoverLink key={link.href} {...link} />
          ))}
        </div>
      </PopoverPanel>
    </Popover>
  )
}
