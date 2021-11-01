import React from 'react'

import { Breadcrumbs as BreadcrumbsPure } from '@oxide/ui'
import { useMatches } from '../hooks/use-matches'

export function Breadcrumbs() {
  const matches = (useMatches() || []).filter((m) => m.route.crumb)
  let crumbs = matches.map((m, i) => ({
    label:
      typeof m.route.crumb === 'function'
        ? m.route.crumb(m)
        : typeof m.route.crumb === 'string'
        ? m.route.crumb
        : 'WHOOPS', // FIX ME lol
    // last one is the page we're on, so no link
    href: i < matches.length - 1 ? m.pathname : undefined,
  }))
  // for now just hard code in the root one
  crumbs = [{ label: 'Maze War', href: '/' }, ...crumbs]
  console.log({ matches, crumbs })
  return <BreadcrumbsPure data={crumbs} />
}
