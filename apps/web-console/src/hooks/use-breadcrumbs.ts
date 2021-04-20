import { useLocation } from 'react-router-dom'

import type { Crumb } from '@oxide/ui'

type SpecialLabel = {
  applies: boolean
  items: Crumb[]
}

// TODO: this could be generalized to pull the label out of the route
// but it would be premature until we have more routes like this
const specialItems = (path: string): SpecialLabel[] => [
  {
    applies: path.endsWith('/instances-new'),
    items: [
      { href: path.replace(/-new$/, ''), label: 'instances' },
      { label: 'Create instance' },
    ],
  },
  {
    applies: path.endsWith('/projects-new'),
    items: [
      { href: path.replace(/-new$/, ''), label: 'projects' },
      { label: 'Create project' },
    ],
  },
]

const getSpecialItems = (pathSoFar: string): Crumb[] | undefined =>
  specialItems(pathSoFar).find((sp) => sp.applies)?.items

export const breadcrumbsForPath = (path: string): Crumb[] => {
  const pathParts = path === '/' ? [] : path.split('/').slice(1)

  const crumbsFor = (pathPart: string, i: number): Crumb[] => {
    const pathSoFar = '/' + pathParts.slice(0, i + 1).join('/')
    const isLastCrumb = i === pathParts.length - 1

    return (
      getSpecialItems(pathSoFar) || [
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
