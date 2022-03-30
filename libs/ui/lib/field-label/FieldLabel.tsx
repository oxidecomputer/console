import React from 'react'
import type { ElementType, PropsWithChildren } from 'react'
import { Wrap } from '../../util/wrap'
import { Info8Icon, Tooltip } from '@oxide/ui'

/**
 * Ensures that label always has an `htmlFor` prop associated with it
 */
type FieldLabelProps<T extends ElementType> = (
  | {
      id: string
      htmlFor?: string
      as?: never
    }
  | {
      as: 'label'
      htmlFor: string
      id?: never
    }
  | {
      as?: never
      htmlFor: string
      id?: never
    }
  | {
      as: Exclude<T, 'label'>
      htmlFor?: string
      id?: never
    }
) & {
  tip?: string
  optional?: boolean
}

export const FieldLabel = <T extends ElementType = 'label'>({
  id,
  children,
  htmlFor,
  tip,
  optional,
  as,
}: PropsWithChildren<FieldLabelProps<T>>) => {
  const Component = as || 'label'
  return (
    <Wrap with={<div className="flex space-x-2" />} when={tip}>
      <Component
        id={id}
        className="mb-2 flex items-center text-sans-sm"
        htmlFor={htmlFor}
      >
        {children}
        {optional && (
          // Announcing this optional text is unnecessary as the required attribute on the
          // form will be used
          <span className="pl-1 text-secondary" aria-hidden="true">
            (Optional)
          </span>
        )}
      </Component>
      {tip && (
        <Tooltip id={`${id}-tip`} content={tip}>
          <Info8Icon />
        </Tooltip>
      )}
    </Wrap>
  )
}
