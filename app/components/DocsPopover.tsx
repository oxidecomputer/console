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
    className="group block px-4 last:*:border-0"
    target="_blank"
    rel="noreferrer"
  >
    <div className="border-secondary mx-2 border-b py-1.5">
      <div className="text-sans-md text-raise group-hover:bg-tertiary relative -ml-2 inline-block rounded py-1 pr-7 pl-2">
        <span className="inline-block max-w-300 truncate align-middle">{linkText}</span>
        <OpenLink12Icon className="text-secondary absolute top-1.5 ml-2 translate-y-px" />
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
      <PopoverButton title={title} className="rounded">
        <div className={cn(buttonStyle({ size: 'sm', variant: 'ghost' }), 'w-8')}>
          <Info16Icon aria-hidden className="shrink-0" />
        </div>
      </PopoverButton>
      <PopoverPanel
        // popover-panel needed for enter animation
        className="popover-panel bg-raise border-secondary elevation-2 z-10 w-96 rounded-lg border"
        anchor={{ to: 'bottom end', gap: 12 }}
      >
        <div className="px-4">
          <h2 className="text-sans-md mt-4 flex items-center gap-1">
            <div className="text-accent-secondary mr-1 flex items-center">{icon}</div>
            {title}
          </h2>
          <p className="text-sans-md text-default mt-2 mb-3">{summary}</p>
        </div>
        <div className="border-secondary border-t pb-1">
          <h3 className="text-mono-sm text-tertiary mt-3 mb-1 px-4">Guides</h3>
          {links.map((link) => (
            <DocsPopoverLink key={link.href} {...link} />
          ))}
        </div>
      </PopoverPanel>
    </Popover>
  )
}
