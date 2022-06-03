import { Breadcrumbs as BreadcrumbsPure } from '@oxide/ui'
import { useMatches } from 'react-router-dom'
import invariant from 'tiny-invariant'
import type { Merge, SetRequired } from 'type-fest'

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
        !m.handle || ['string', 'function'].includes(typeof m.handle.crumb),
        `Route crumb must be a string or function if present. Check Route for ${m.pathname}.`
      )
      return m as ValidatedMatch
    })
    // hasCrumb could be inline (m) => m.handle?.crumb, but it's extracted so we can
    // give it a guard type so the typing is nice around filter()
    .filter(hasCrumb)
    .map((m, i, arr) => ({
      label: typeof m.handle.crumb === 'function' ? m.handle.crumb(m) : m.handle.crumb,
      // last one is the page we're on, so no link
      href: i < arr.length - 1 ? m.pathname : undefined,
    }))

export function Breadcrumbs() {
  return <BreadcrumbsPure data={useCrumbs()} />
}
