import React from 'react'
import { Link } from 'react-router-dom'
import tw from 'twin.macro'

export type Crumb = { href?: string; label: string }

export interface BreadcrumbsProps {
  data: Crumb[]
}

const Item = tw.li`inline-block not-first:before:(content['/'] mx-2 text-yellow-500)`

const Link_ = tw(Link)`visited:text-gray-400 hover:text-green-500`

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ data }) => (
  <ol tw="text-sm uppercase">
    {data.map(({ href, label }) => (
      <Item key={`${href}-${label}`}>
        {href ? (
          <Link_ to={href}>{label}</Link_>
        ) : (
          <span tw="text-gray-500">{label}</span>
        )}
      </Item>
    ))}
  </ol>
)
