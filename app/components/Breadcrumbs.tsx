/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { Link } from 'react-router-dom'

import { PrevArrow12Icon } from '@oxide/design-system/icons/react'

import { useCrumbs } from '~/hooks/use-title'
import { Slash } from '~/ui/lib/Slash'
import { intersperse } from '~/util/array'

export function Breadcrumbs() {
  const crumbs = useCrumbs()
  const isTopLevel = crumbs.length <= 1
  return (
    <nav
      className="flex items-center gap-0.5 overflow-clip pr-4 text-sans-md"
      aria-label="Breadcrumbs"
    >
      <PrevArrow12Icon
        className={cn('mx-1.5 flex-shrink-0 text-quinary', isTopLevel && 'opacity-40')}
      />

      {intersperse(
        crumbs.map(({ label, path }, i) => (
          <Link
            to={path}
            className={cn(
              'whitespace-nowrap text-sans-md hover:text-secondary',
              // make the last breadcrumb brighter, but only if we're below the top level
              !isTopLevel && i === crumbs.length - 1 ? 'text-secondary' : 'text-tertiary'
            )}
            key={`${label}|${path}`}
          >
            {label}
          </Link>
        )),
        <Slash />
      )}
    </nav>
  )
}
