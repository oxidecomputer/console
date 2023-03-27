import type { ElementType, PropsWithChildren } from 'react'

import { Question12Icon, Tooltip } from '@oxide/ui'

interface FieldLabelProps {
  id: string
  as?: ElementType
  htmlFor?: string
  tip?: string
  optional?: boolean
}

export const FieldLabel = ({
  id,
  children,
  htmlFor,
  tip,
  optional,
  as,
}: PropsWithChildren<FieldLabelProps>) => {
  const Component = as || 'label'
  return (
    <div className="flex h-4 items-center space-x-2">
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
          <button className="svg:pointer-events-none">
            <Question12Icon className="text-quinary" />
          </button>
        </Tooltip>
      )}
    </div>
  )
}
