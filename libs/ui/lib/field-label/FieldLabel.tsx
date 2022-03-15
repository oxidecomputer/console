import React from 'react'
import type { ElementType, PropsWithChildren } from 'react'
import { Wrap } from '../../util/wrap'
import { Info8Icon, Tooltip } from '@oxide/ui'

/**
 * Ensures that label always has an `htmlFor` prop associated with it
 */
type FieldLabelProps<T extends ElementType> = (
  | {
      as: 'label'
      htmlFor: string
    }
  | {
      as?: never
      htmlFor: string
    }
  | {
      as: Exclude<T, 'label'>
      htmlFor?: string
    }
) & {
  tip?: string
}

export const FieldLabel = <T extends ElementType = 'label'>({
  children,
  htmlFor,
  tip,
  as,
}: PropsWithChildren<FieldLabelProps<T>>) => {
  const Component = as || 'label'
  return (
    <Wrap with={<div className="flex space-x-2" />} when={tip}>
      <Component
        className="flex h-6 items-center text-sans-sm"
        htmlFor={htmlFor}
      >
        {children}
      </Component>
      {tip && (
        <Tooltip isPrimaryLabel={false} content={tip}>
          <Info8Icon />
        </Tooltip>
      )}
    </Wrap>
  )
}
