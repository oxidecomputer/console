import React from 'react'

interface DefaultHeaderProps {
  children: React.ReactNode
}
export const DefaultHeader = ({ children }: DefaultHeaderProps) => (
  <div className="text-left mx-4">{children}</div>
)
