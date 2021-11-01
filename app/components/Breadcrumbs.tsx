import React from 'react'

import { Breadcrumbs as BreadcrumbsPure } from '@oxide/ui'
import { useMatches } from '../hooks/use-matches'

export function Breadcrumbs() {
  const matches = (useMatches() || []).filter((m) => m.route.crumb)
  const crumbs = matches.map((m, i) => ({
    label:
      // at this point we've already filtered out all falsy crumbs
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      typeof m.route.crumb === 'function' ? m.route.crumb(m) : m.route.crumb!,
    // last one is the page we're on, so no link
    href: i < matches.length - 1 ? m.pathname : undefined,
  }))
  return <BreadcrumbsPure data={crumbs} />
}
