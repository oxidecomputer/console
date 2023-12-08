/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { OpenLink12Icon } from '@oxide/design-system/icons/react'

export const NewTabLink = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-center space-x-2"
  >
    <OpenLink12Icon className="text-accent group-hover:text-accent" />
    <span className="group-hover:text-default">{label}</span>
  </a>
)
