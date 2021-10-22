import type {
  ComponentType,
  ReactChildren,
  ReactElement,
  ReactNode,
} from 'react'

export type ChildrenProp = { children?: ReactNode }
type ChildArray = ReturnType<ReactChildren['toArray']>
type ChildSelector = Parameters<ChildArray['findIndex']>[0]

export const pluck = (
  children: ChildArray,
  selector: ChildSelector
): ChildArray[number] | null => {
  const childIndex = children.findIndex(selector)
  return childIndex !== -1 ? children.splice(childIndex, 1)[0] : null
}

export const pluckType = <P>(
  children: ChildArray,
  componentType: ComponentType<P>
) => {
  return pluck(
    children,
    (child) => (child as ReactElement)?.type === componentType
  )
}
