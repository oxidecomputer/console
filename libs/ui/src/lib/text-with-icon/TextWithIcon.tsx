import React from 'react'
import 'twin.macro'

interface Props {
  children: React.ReactNode
  className?: string
}

// Could be called InlineSpacing, but it's meant specifically for combining text
// with icons inline. TW's space-x-3 is the more general utility for spacing
export const TextWithIcon = ({ children, className }: Props) => (
  <span tw="inline-flex items-center gap-2" className={className}>
    {children}
  </span>
)
