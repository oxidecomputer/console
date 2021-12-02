import React from 'react'

interface DefaultHeaderProps {
  children: React.ReactNode
}
export const DefaultHeader = ({ children }: DefaultHeaderProps) => (
  <span>{children}</span>
)
