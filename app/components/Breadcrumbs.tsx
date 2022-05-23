import type { Crumb } from '@oxide/ui'
import { Breadcrumbs as BreadcrumbsPure } from '@oxide/ui'
import { useMatches } from 'react-router-dom'

// TODO: fix this when they export a type for it
type Matches = ReturnType<typeof useMatches>

export function matchesToCrumbs(matches: Matches): Crumb[] {
  const filtered = matches.filter((m) => m.handle?.crumb)
  return filtered.map((m, i) => ({
    label:
      // at this point we've already filtered out all falsy crumbs
      typeof m.handle.crumb === 'function' ? m.handle.crumb(m) : m.handle.crumb!,
    // last one is the page we're on, so no link
    href: i < filtered.length - 1 ? m.pathname : undefined,
  }))
}

export function Breadcrumbs() {
  const matches = useMatches() || []
  return <BreadcrumbsPure data={matchesToCrumbs(matches)} />
}
