/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import {
  Popover,
  type _internal_ComponentPopoverButton,
  type _internal_ComponentPopoverPanel,
} from '@headlessui/react'
import { useState } from 'react'
import { usePopper } from 'react-popper'

import { OpenLink12Icon, Question16Icon } from '@oxide/design-system/icons/react'

import { Message } from '~/ui/lib/Message'

import { ExternalLink } from './ExternalLink'

type ContextualDocsLinkProps = {
  href: string
  linkText: string
}

export const ContextualDocsLink = ({ href, linkText }: ContextualDocsLinkProps) => (
  <div className="mx-2 border-b py-3 border-secondary last:border-0">
    <ExternalLink href={href} className="no-underline text-sans-sm !text-default">
      {linkText} <OpenLink12Icon className="ml-0.5 translate-y-[1px] text-tertiary" />
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
  const [referenceElement, setReferenceElement] = useState()
  const [popperElement, setPopperElement] = useState()
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-end',
    modifiers: [{ name: 'offset', options: { offset: [0, 6] } }],
  })
  return (
    <Popover>
      <Popover.Button
        ref={setReferenceElement}
        className="ox-button btn-secondary flex inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-4 align-top text-mono-sm elevation-1 svg:w-5"
      >
        <Question16Icon className="text-quaternary" />
        <span>Learn</span>
      </Popover.Button>
      <Popover.Panel
        className="z-10 max-w-md rounded-lg border bg-raise border-secondary elevation-1"
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
      >
        <div className="px-4">
          <h2 className="my-4 flex items-center gap-2">
            <div className="text-accent-secondary">{icon}</div>
            {heading}
          </h2>
          <Message variant="info" className="my-4" content={summary} />
        </div>
        <div className="border-t px-4 border-secondary">
          <h3 className="mt-4 text-mono-sm text-quaternary">Guides</h3>
          {links.map((link) => (
            <ContextualDocsLink key={link.href} {...link} />
          ))}
        </div>
        <div className="flex justify-end border-t p-4 border-secondary">
          <ExternalLink
            href="https://docs.oxide.computer/guides/introduction"
            className="ox-button btn-secondary flex inline-flex h-10 shrink-0 items-center justify-center gap-0.5 rounded-lg px-4 align-top no-underline text-mono-sm elevation-1 svg:w-5"
          >
            <span className="text-secondary">Go to docs</span>
            <OpenLink12Icon className="text-tertiary" />
          </ExternalLink>
        </div>
      </Popover.Panel>
    </Popover>
  )
}
