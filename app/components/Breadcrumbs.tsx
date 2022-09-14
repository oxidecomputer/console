import { useEffect } from 'react'
import { useMatches } from 'react-router-dom'
import invariant from 'tiny-invariant'
import type { Merge, SetRequired } from 'type-fest'

import { Breadcrumbs as BreadcrumbsPure } from '@oxide/ui'

type UseMatchesMatch = ReturnType<typeof useMatches>[number]

export type CrumbFunc = (m: UseMatchesMatch) => string

type ValidatedMatch = Merge<UseMatchesMatch, { handle?: { crumb: string | CrumbFunc } }>

function hasCrumb(m: ValidatedMatch): m is SetRequired<ValidatedMatch, 'handle'> {
  return !!(m.handle && m.handle.crumb)
}

const useCrumbs = () =>
  useMatches()
    .map((m) => {
      invariant(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !m.handle || ['string', 'function'].includes(typeof (m.handle as any).crumb),
        `Route crumb must be a string or function if present. Check Route for ${m.pathname}.`
      )
      return m as ValidatedMatch
    })
    // hasCrumb could be inline (m) => m.handle?.crumb, but it's extracted so we can
    // give it a guard type so the typing is nice around filter()
    .filter(hasCrumb)
    .map((m) => ({
      label: typeof m.handle.crumb === 'function' ? m.handle.crumb(m) : m.handle.crumb,
      href: m.pathname,
    }))

export function Breadcrumbs() {
  const crumbs = useCrumbs()
  // output
  // non top-level route: Instances / mock-project / Projects / maze-war / Oxide Console
  // top-level route: Oxide Console
  const title = crumbs
    .slice() // avoid mutating original with reverse()
    .reverse()
    .map((item) => item.label)
    .concat('Oxide Console')
    .join(' / ')

  // TODO: move this to a root layout so we don't lose it
  useEffect(() => {
    document.title = title
  }, [title])

  // remove last crumb which is the page we are on
  return <BreadcrumbsPure data={crumbs.slice(0, -1)} />
}
