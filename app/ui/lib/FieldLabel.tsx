/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import type { ElementType, PropsWithChildren } from 'react'

import { Question12Icon, Tooltip } from '@oxide/ui'

interface FieldLabelProps {
  id: string
  as?: ElementType
  htmlFor?: string
  tip?: string
  optional?: boolean
  className?: string
}

export const FieldLabel = ({
  id,
  children,
  htmlFor,
  tip,
  optional,
  as,
  className,
}: PropsWithChildren<FieldLabelProps>) => {
  const Component = as || 'label'
  return (
    <div className={cn(className, 'flex h-4 items-center space-x-2')}>
      <Component id={id} className="flex items-center text-sans-md" htmlFor={htmlFor}>
        {children}
        {optional && (
          // Announcing this optional text is unnecessary as the required attribute on the
          // form will be used
          <span className="pl-1 text-tertiary" aria-hidden="true">
            (Optional)
          </span>
        )}
      </Component>
      {tip && (
        <Tooltip content={tip} placement="top">
          <button className="svg:pointer-events-none" type="button">
            <Question12Icon className="text-quinary" />
          </button>
        </Tooltip>
      )}
    </div>
  )
}
