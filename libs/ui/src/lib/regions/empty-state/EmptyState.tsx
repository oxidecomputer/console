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
  justify-content: center;

  position: relative;
  min-height: 50vh;
  overflow: hidden;
`

const Decoration = styled.div<{ align?: string }>`
  z-index: 0;
  position: absolute;
  ${({ align }) => {
    if (align === 'top') {
      return `top: 0; left: 0;`
    }
    if (align === 'bottom') {
      return `bottom: 0; right: 0;`
    }
  }};

  max-width: ${({ theme }) => theme.spacing(44)};
  width: 100%;
  overflow: hidden;
`

const Content = styled.div`
  z-index: 1;
  margin: 0 auto;
  max-width: ${({ theme }) => theme.spacing(120)};
  padding: ${({ theme }) => theme.spacing(6)};
`

export const EmptyState: FC<EmptyStateProps> = ({ children }) => {
  return (
    <Wrapper>
      <Decoration align="top">
        <EmptyStateLeft />
      </Decoration>
      <Content>{children}</Content>
      <Decoration align="bottom">
        <EmptyStateRight />
      </Decoration>
    </Wrapper>
  )
}
