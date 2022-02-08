import React from 'react'
import { Link } from 'react-router-dom'

export type Crumb = { href?: string; label: string }

export interface BreadcrumbsProps {
  data: Crumb[]
}

export const Breadcrumbs = ({ data }: BreadcrumbsProps) => (
  <ol className="text-mono-md">
    {data.map(({ href, label }) => (
      <li
        className="inline-block before:mx-2 
                   before:content-['/'] before:text-quaternary before:first-of-type:content-none"
        key={`${href}-${label}`}
      >
        {href ? (
          <Link to={href} className="text-tertiary hover:text-secondary">
            {label}
          </Link>
        ) : (
          <span className="text-secondary">{label}</span>
        )}
      </li>
    ))}
  </ol>
)
