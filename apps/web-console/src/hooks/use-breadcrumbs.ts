import { useLocation } from 'react-router-dom'

import type { Crumb } from '@oxide/ui'

// TODO: this could be generalized to pull the label out of the route
// but it would be premature until we have more routes like this
const specialCrumbs = (path: string) => [
  {
    applies: /^\/projects\/[^/]+\/instances-new$/.test(path),
    crumbs: [
      { href: path.replace(/-new$/, ''), label: 'instances' },
      { label: 'Create instance' },
    ],
  },
  {
    applies: path === '/projects-new',
    crumbs: [
      { href: path.replace(/-new$/, ''), label: 'projects' },
      { label: 'Create project' },
    ],
  },
]

const getSpecialCrumbs = (pathSoFar: string): Crumb[] | undefined =>
  specialCrumbs(pathSoFar).find((sp) => sp.applies)?.crumbs

export const breadcrumbsForPath = (path: string): Crumb[] => {
  const pathParts = path === '/' ? [] : path.split('/').slice(1)

  const crumbsFor = (pathPart: string, i: number): Crumb[] => {
    const pathSoFar = '/' + pathParts.slice(0, i + 1).join('/')
    const isLastCrumb = i === pathParts.length - 1

    return (
      getSpecialCrumbs(pathSoFar) || [
        {
          label: pathPart,
          href: isLastCrumb ? undefined : pathSoFar,
        },
      ]
    )
  }

  return [{ href: '/', label: 'Maze War' }, ...pathParts.flatMap(crumbsFor)]
}

export function useBreadcrumbs() {
  const location = useLocation()
  return breadcrumbsForPath(location.pathname)
}
