import React from 'react'

import { Text } from '../text/Text'
import styled from 'styled-components'

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

  margin-left: ${(props) => props.theme.spacing(2)};
  padding-left: ${(props) => props.theme.spacing(3)};

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
                <a href={item.href}>
                  <Text size="sm">{item.label}</Text>
                </a>
              </StyledListItem>
            )
          }
          return (
            <StyledListItem key={`breadcrumbs-${index}`}>
              <Text size="sm">{item.label}</Text>
            </StyledListItem>
          )
        })}
      </StyledList>
    )
  }
  return null
}

export default Breadcrumbs
