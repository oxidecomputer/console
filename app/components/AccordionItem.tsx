/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as Accordion from '@radix-ui/react-accordion'
import cn from 'classnames'
import { useEffect, useRef } from 'react'

import { DirectionRightIcon } from '@oxide/design-system/icons/react'

type AccordionItemProps = {
  children: React.ReactNode
  isOpen: boolean
  label: string
  value: string
}

export const AccordionItem = ({ children, isOpen, label, value }: AccordionItemProps) => {
  const contentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isOpen])

  return (
    <Accordion.Item value={value}>
      <Accordion.Header className="max-w-lg">
        <Accordion.Trigger className="group flex w-full items-center justify-between border-t pt-2 text-sans-xl border-secondary [&>svg]:data-[state=open]:rotate-90">
          <div className="text-secondary">{label}</div>
          <DirectionRightIcon className="transition-all text-secondary" />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content
        ref={contentRef}
        forceMount
        className={cn('ox-accordion-content overflow-hidden py-8', { hidden: !isOpen })}
      >
        {children}
      </Accordion.Content>
    </Accordion.Item>
  )
}
