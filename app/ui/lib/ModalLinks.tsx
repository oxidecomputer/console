/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ReactNode } from 'react'

import { OpenLink12Icon } from '@oxide/design-system/icons/react'

export const ModalLinks = ({
  heading,
  children,
}: {
  heading: string
  children: ReactNode
}) => (
  <div>
    <h3 className="mb-2 text-sans-semi-md text-raise">{heading}</h3>
    <ul className="space-y-1 text-sans-md text-secondary">{children}</ul>
  </div>
)

export const ModalLink = ({ to, label }: { to: string; label: string }) => (
  <li>
    <a
      href={to}
      key={to}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center space-x-2"
    >
      <OpenLink12Icon className="text-accent group-hover:text-accent" />
      <span className="group-hover:text-raise">{label}</span>
    </a>
  </li>
)
