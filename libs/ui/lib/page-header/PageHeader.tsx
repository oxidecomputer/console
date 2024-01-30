/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ReactElement } from 'react'

import { classed } from '@oxide/util'

export const PageHeader = classed.header`mb-16 mt-12 flex items-center justify-between`

interface PageTitleProps {
  icon?: ReactElement
  children: React.ReactNode
}
export const PageTitle = ({ children: title, icon }: PageTitleProps) => {
  return (
    <h1 className="inline-flex items-center space-x-2 text-sans-3xl text-accent-secondary">
      {icon}
      <span className="text-accent">{title}</span>
    </h1>
  )
}
