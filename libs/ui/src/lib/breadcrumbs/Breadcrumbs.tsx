import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { Text } from '../text/Text'

export type Crumb = { href?: string; label: string }

export interface BreadcrumbsProps {
  /**
   * Render an ordered list using this 'data' prop. Each item in the array is an
   * object with the keys 'href' and 'label'. Links will render if an 'href' is
   * present. The name of the breadcrumb will be the corresponding 'label'.
   */
  data?: Crumb[]
}

const StyledList = styled(Text).attrs({ as: 'ol', size: 'sm' })`
  text-transform: uppercase;
`

const StyledListItem = styled.li`
  display: inline-block;

  &:not(:first-child):before {
    content: '/';

    display: inline-flex;
    margin: 0 ${({ theme }) => theme.spacing(2)};

    color: ${({ theme }) => theme.color('yellow500')};
  }
`

const StyledLink = styled(Link)`
  &:link,
  &:visited {
    color: ${({ theme }) => theme.color('gray400')};
  }
  &:hover {
    color: ${({ theme }) => theme.color('green500')};
  }
`

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ data, ...rest }) => {
  if (data && !!data.length) {
    return (
      <StyledList {...rest}>
        {data.map((item, index) => {
          if (item.href) {
            return (
              <StyledListItem key={`breadcrumbs-${index}`}>
                <StyledLink to={item.href}>{item.label}</StyledLink>
              </StyledListItem>
            )
          }
          return (
            <StyledListItem key={`breadcrumbs-${index}`}>
              <Text color="gray500">{item.label}</Text>
            </StyledListItem>
          )
        })}
      </StyledList>
    )
  }
  return null
}
