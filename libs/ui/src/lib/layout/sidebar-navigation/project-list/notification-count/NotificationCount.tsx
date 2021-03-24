import type { FC } from 'react'
import React from 'react'
import styled from 'styled-components'
import Text from '../../../../text/Text'

/* eslint-disable-next-line */
export interface NotificationCountProps {
  count: number
}

const Container = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;

  width: ${({ theme }) => theme.spacing(4)};
  background-color: ${({ theme }) => theme.color('yellow500')};

  border-radius: 50%;
`

const Count = styled(Text).attrs({ weight: 400, size: 'xs' })`
  position: relative;
  bottom: 1px;

  color: ${({ theme }) => theme.color('yellow900')};
`

export const NotificationCount: FC<NotificationCountProps> = (
  { count },
  ...rest
) => {
  return (
    <Container {...rest}>
      <Count>{count}</Count>
    </Container>
  )
}

export default NotificationCount
