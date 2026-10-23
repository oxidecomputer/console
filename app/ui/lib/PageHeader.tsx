/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ReactElement } from 'react'

import { classed } from '~/util/classed'

import { Truncate } from './Truncate'

// Title is allowed to shrink (`min-w-0`); actions keep their intrinsic width so
// long names ellipsize instead of shoving buttons off-screen. Below 500px the
// actions stack above the title and each row can use the full width.
export const PageHeader = classed.header`mb-16 mt-12 flex w-full min-w-0 justify-between gap-4 max-500:flex-col max-500:*:last:order-0 max-500:*:first:order-1 500:items-center 500:[&>h1]:flex-1 500:[&>:not(h1)]:shrink-0 max-1000:mt-8`

interface PageTitleProps {
  icon?: ReactElement
  children: string
}
export const PageTitle = ({ children: title, icon }: PageTitleProps) => {
  return (
    <h1 className="text-sans-3xl text-accent-secondary light:text-accent-tertiary flex min-w-0 items-center gap-2 [&>svg]:shrink-0">
      {icon}
      <Truncate text={title} className="text-accent light:text-raise min-w-0 flex-1" />
    </h1>
  )
}
