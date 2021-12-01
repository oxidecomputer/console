import React from 'react'
import { Link } from 'react-router-dom'

export type Crumb = { href?: string; label: string }

export interface BreadcrumbsProps {
  data: Crumb[]
}

export const Breadcrumbs = ({ data }: BreadcrumbsProps) => (
  <ol className="text-xs font-mono uppercase">
    {data.map(({ href, label }) => (
      <li
        className="inline-block before:first-of-type:content-none 
                   before:content-['/'] before:mx-2 before:text-gray-400"
        key={`${href}-${label}`}
      >
        {href ? (
          <Link to={href} className="text-gray-100 hover:text-green-500">
            {label}
          </Link>
        ) : (
          <span className="text-gray-50">{label}</span>
        )}
      </li>
    ))}
  </ol>
)
