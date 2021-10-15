import type { ComponentType, ReactChildren, ReactElement } from 'react'

type ChildArray = ReturnType<ReactChildren['toArray']>
type ChildSelector = Parameters<ChildArray['findIndex']>[0]

export const pluck = (children: ChildArray, selector: ChildSelector) => {
  const childIndex = children.findIndex(selector)
  return childIndex !== -1 ? children.splice(childIndex, 1) : null
}

export const pluckType = (
  children: ChildArray,
  componentType: ComponentType<unknown>
) => {
  return pluck(
    children,
    (child) => (child as ReactElement)?.type === componentType
  )
}
