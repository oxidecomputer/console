import React from 'react'

import styled, { StyledComponent, DefaultTheme } from 'styled-components'

import { Text, TextProps } from '../text/Text'

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
  position: relative;
  display: inline-block;
  margin-left: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(4)};
  &:first-child {
    margin-left: 0;
    padding-left: 0;
  }
  &:not(:first-child):before {
    content: '/';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    color: ${({ theme }) => theme.color('yellow500')};
  }
`

const Link = styled(Text).attrs({
  size: 'sm',
  font: 'mono',
  weight: 400,
  as: 'a',
})`
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
              <Text font="mono" size="sm" color="gray400">
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
