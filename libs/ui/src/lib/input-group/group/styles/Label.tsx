import React from 'react'
import 'twin.macro'

type LabelProps = React.ComponentProps<'label'> & { required?: boolean }

export const Label = ({ required, children, ...labelProps }: LabelProps) => (
  <label {...labelProps} tw="flex items-baseline justify-between pb-2">
    <span tw="flex items-baseline font-medium">{children}</span>
    {!required && <span tw="text-sm">Optional</span>}
  </label>
)
