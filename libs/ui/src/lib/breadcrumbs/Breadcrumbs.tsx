import React from 'react'
import styled from 'styled-components'

import { Text } from '../text/Text'

export interface BreadcrumbsProps {
  data?: { href?: string; label: string }[]
}

const StyledList = styled.ol`
  list-style-type: none;
  margin: ${(props) => props.theme.spacing(4)} 0 0 0;
  padding: 0;

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

export const Breadcrumbs = (props: BreadcrumbsProps) => {
  const { data } = props
  if (data && !!data.length) {
    return (
      <StyledList>
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
