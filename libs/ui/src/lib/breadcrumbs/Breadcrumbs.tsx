import React from 'react'

import type { DefaultTheme, StyledComponent } from 'styled-components'
import styled from 'styled-components'

import type { TextProps } from '../text/Text'
import { Text } from '../text/Text'

export interface BreadcrumbsProps {
  /**
   * Render an ordered list using this 'data' prop. Each item in the array is an object with the keys 'href' and 'label'. Links will render if an 'href' is present. The name of the breadcrumb will be the corresponding 'label'.
   */
  data?: { href?: string; label: string }[]
}

const StyledList = styled.ol`
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

const Link = styled(Text).attrs({ size: 'sm', as: 'a' })`
  &:link,
  &:visited {
    color: ${({ theme }) => theme.color('gray400')};
  }
  &:hover {
    color: ${({ theme }) => theme.color('green500')};
  }
` as StyledComponent<'a', DefaultTheme, TextProps>

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ data, ...rest }) => {
  if (data && !!data.length) {
    return (
      <StyledList {...rest}>
        {data.map((item, index) => {
          if (item.href) {
            return (
              <StyledListItem key={`breadcrumbs-${index}`}>
                <Link href={item.href}>{item.label}</Link>
              </StyledListItem>
            )
          }
          return (
            <StyledListItem key={`breadcrumbs-${index}`}>
              <Text size="sm" color="gray500">
                {item.label}
              </Text>
            </StyledListItem>
          )
        })}
      </StyledList>
    )
  }
  return null
}

export default Breadcrumbs
