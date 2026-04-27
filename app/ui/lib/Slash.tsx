/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'

export const Slash = ({ className }: { className?: string }) => (
  <span className={cn('text-quaternary selected:text-accent-disabled mx-1', className)}>
    /
  </span>
)
