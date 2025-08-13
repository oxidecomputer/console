/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import type { ElementType, PropsWithChildren, ReactNode } from 'react'

interface FieldLabelProps {
  id: string
  as?: ElementType
  htmlFor?: string
  optional?: boolean
  className?: string
}

export const FieldLabel = ({
  id,
  children,
  htmlFor,
  optional,
  as,
  className,
}: PropsWithChildren<FieldLabelProps>) => {
  const Component = as || 'label'
  return (
    <div className={cn(className, 'flex h-4 items-center space-x-2')}>
      <Component
        id={id}
        className="flex items-center text-sans-md text-raise"
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
    </div>
  )
}

type HintProps = {
  // ID required as a reminder to pass aria-describedby on TextField
  id: string
  children: ReactNode
  className?: string
}

/**
 * Pass id here and include that ID in aria-describedby on the TextField
 */
export const InputHint = ({ id, children, className }: HintProps) => (
  <div
    id={id}
    className={cn(
      'mt-1 text-sans-sm text-secondary [&_>_a]:underline hover:[&_>_a]:text-raise',
      className
    )}
  >
    {children}
  </div>
)
