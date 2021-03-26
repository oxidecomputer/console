import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'

import EmptyStateLeft from '../../../assets/empty-state-left.svg'
import EmptyStateRight from '../../../assets/empty-state-right.svg'

/* eslint-disable-next-line */
export interface EmptyStateProps {}

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
`

const Decoration = styled.div<{ align?: string }>`
  ${({ align }) => align && `align-self: ${align};`};
  width: 100%;
`

const Content = styled.div`
  padding: ${({ theme }) => theme.spacing(6)};
`

export const EmptyState: FC<EmptyStateProps> = ({ children }) => {
  return (
    <Wrapper>
      <Decoration align="flex-start">
        <EmptyStateLeft />
      </Decoration>
      <Content>{children}</Content>
      <Decoration align="flex-end">
        <EmptyStateRight />
      </Decoration>
    </Wrapper>
  )
}
