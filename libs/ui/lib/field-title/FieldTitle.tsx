import React from 'react'
import type { ElementType, PropsWithChildren } from 'react'
import { Wrap } from '../../util/children'
import { Icon, Tooltip } from '@oxide/ui'

type FieldTitleProps<T extends ElementType> = (
  | {
      as?: never
      htmlFor: string
    }
  | {
      as: T
      htmlFor?: string
    }
) & {
  tip?: string
}

export const FieldTitle = <T extends ElementType = 'label'>({
  children,
  htmlFor,
  tip,
  as,
}: PropsWithChildren<FieldTitleProps<T>>) => {
  const Component = as || 'label'
  return (
    <Wrap with={<div className="flex space-x-1" />} when={tip}>
      <Component
        className="block text-lg font-sans font-light mb-2"
        htmlFor={htmlFor}
      >
        {children}
      </Component>
      {tip && (
        <Tooltip isPrimaryLabel={false} content={tip}>
          <Icon name="info" />
        </Tooltip>
      )}
    </Wrap>
  )
}
