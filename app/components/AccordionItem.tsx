/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as Accordion from '@radix-ui/react-accordion'
import cn from 'classnames'

import { DirectionRightIcon } from '@oxide/design-system/icons/react'

type AccordionItemProps = {
  children: React.ReactNode
  label: string
  value: string
}

// This is a simplified AccordionItem component that does not concern itself with scrolling into view when expanded
// See instance-create for a more involved example, including scrolling
export const AccordionItem = ({ children, label, value }: AccordionItemProps) => {
  return (
    <Accordion.Item value={value}>
      <Accordion.Header className="max-w-lg">
        <Accordion.Trigger className="group flex w-full items-center justify-between border-t pt-2 text-sans-xl border-secondary [&>svg]:data-[state=open]:rotate-90">
          <div className="text-secondary">{label}</div>
          <DirectionRightIcon className="transition-all text-secondary" />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className={cn('ox-accordion-content overflow-hidden py-4')}>
        {children}
      </Accordion.Content>
    </Accordion.Item>
  )
}
