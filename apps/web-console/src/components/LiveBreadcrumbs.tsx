import React from 'react'
import { useLocation } from 'react-router-dom'

import type { Crumb } from '@oxide/ui'
import { Breadcrumbs } from '@oxide/ui'

type SpecialLabel = {
  pred: (p: string) => boolean
  label: string
}

const specialLabels: SpecialLabel[] = [
  {
    pred: (path) => path.endsWith('/instances/new'),
    label: 'Create instance',
  },
  {
    pred: (path) => path.endsWith('/projects/new'),
    label: 'Create project',
  },
]

const getSpecialLabel = (pathSoFar: string): string | undefined =>
  specialLabels.find((sp) => sp.pred(pathSoFar))?.label

export const breadcrumbsForPath = (path: string): Crumb[] => {
  const pathParts = path === '/' ? [] : path.split('/').slice(1)

  const crumbFor = (pathPart: string, i: number): Crumb => {
    const pathSoFar = '/' + pathParts.slice(0, i + 1).join('/')
    const isLastCrumb = i === pathParts.length - 1

    return {
      label: getSpecialLabel(pathSoFar) || pathPart,
      href: isLastCrumb ? undefined : pathSoFar,
    }
  }

  return [{ href: '/', label: 'Maze War' }, ...pathParts.map(crumbFor)]
}

export const LiveBreadcrumbs = () => {
  const location = useLocation()
  return <Breadcrumbs data={breadcrumbsForPath(location.pathname)} />
}
