/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { offset, useFloating } from '@floating-ui/react'
import { Popover } from '@headlessui/react'

import { OpenLink12Icon, Question16Icon } from '@oxide/design-system/icons/react'

import { ExternalLink } from './ExternalLink'

type ContextualDocsLinkProps = {
  href: string
  linkText: string
}

export const ContextualDocsLink = ({ href, linkText }: ContextualDocsLinkProps) => (
  <div className="border-b px-4 py-2 border-secondary last:border-0">
    <ExternalLink
      href={href}
      className="rounded px-2 py-1 no-underline text-sans-md !text-default hover:bg-tertiary"
    >
      <span>{linkText}</span>
      <OpenLink12Icon className="ml-1 text-tertiary" />
    </ExternalLink>
  </div>
)

type ContextualDocsModalProps = {
  heading: React.ReactNode
  icon: JSX.Element
  links: Array<ContextualDocsLinkProps>
  summary: string
}

export const ContextualDocsModal = ({
  heading,
  icon,
  summary,
  links,
}: ContextualDocsModalProps) => {
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-end',
    middleware: [offset(6)],
  })
  return (
    <Popover>
      <Popover.Button
        ref={refs.setReference}
        className="ox-button btn-secondary flex h-8 w-9  shrink-0 items-center justify-center gap-2 rounded-lg border align-top text-mono-md bg-raise border-secondary elevation-1 svg:w-5"
      >
        <Question16Icon aria-label="Links to learn more" className="text-quaternary" />
      </Popover.Button>
      <Popover.Panel
        className="z-10 max-w-md rounded-lg border bg-raise border-secondary elevation-1"
        ref={refs.setFloating}
        style={floatingStyles}
      >
        <div className="px-4">
          <h2 className="my-3 flex items-center gap-2 text-sans-md">
            <div className="text-accent-secondary">{icon}</div>
            <span className="text-tertiary">Learn:</span>
            {heading}
          </h2>
          <p className="my-3 text-sans-md text-secondary">{summary}</p>
        </div>
        <div className="border-t border-secondary">
          <h3 className="mt-3 px-4 text-mono-sm text-quaternary">Guides</h3>
          {links.map((link) => (
            <ContextualDocsLink key={link.href} {...link} />
          ))}
        </div>
      </Popover.Panel>
    </Popover>
  )
}
