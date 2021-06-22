import React from 'react'
import { Link } from 'react-router-dom'
import tw from 'twin.macro'

export type Crumb = { href?: string; label: string }

export interface BreadcrumbsProps {
  data: Crumb[]
}

const Item = tw.li`inline-block not-first-of-type:before:(content['/'] mx-2 text-grey-4)`

const Link_ = tw(Link)`text-grey-1 visited:text-grey-1 hover:text-green`

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ data }) => (
  <ol tw="text-sm uppercase">
    {data.map(({ href, label }) => (
      <Item key={`${href}-${label}`}>
        {href ? (
          <Link_ to={href}>{label}</Link_>
        ) : (
          <span tw="text-white-off">{label}</span>
        )}
      </Item>
    ))}
  </ol>
)
