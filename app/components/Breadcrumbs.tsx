import type { Crumb } from '@oxide/ui'
import { Breadcrumbs as BreadcrumbsPure } from '@oxide/ui'
import { useMatches } from '../hooks/use-matches'
import type { RouteMatch } from 'react-router-dom'

export function matchesToCrumbs(matches: RouteMatch[]): Crumb[] {
  const filtered = matches.filter((m) => m.route.crumb)
  return filtered.map((m, i) => ({
    label:
      // at this point we've already filtered out all falsy crumbs
      typeof m.route.crumb === 'function' ? m.route.crumb(m) : m.route.crumb!,
    // last one is the page we're on, so no link
    href: i < filtered.length - 1 ? m.pathname : undefined,
  }))
}

export function Breadcrumbs() {
  const matches = useMatches() || []
  return <BreadcrumbsPure data={matchesToCrumbs(matches)} />
}
