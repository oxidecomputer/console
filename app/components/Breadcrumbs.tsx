import type { Crumb } from '@oxide/ui'
import { Breadcrumbs as BreadcrumbsPure } from '@oxide/ui'
import type { UseMatchesMatch } from '@remix-run/router'
import { useMatches } from 'react-router-dom'

export function matchesToCrumbs(matches: UseMatchesMatch[]): Crumb[] {
  const filtered = matches.filter((m) => m.handle?.title)
  return filtered.map((m, i) => ({
    label:
      // at this point we've already filtered out all falsy titles
      typeof m.handle.title === 'function' ? m.handle.title(m) : m.handle.title!,
    // last one is the page we're on, so no link
    href: i < filtered.length - 1 ? m.pathname : undefined,
  }))
}

export function Breadcrumbs() {
  const matches = useMatches() || []
  return <BreadcrumbsPure data={matchesToCrumbs(matches)} />
}
