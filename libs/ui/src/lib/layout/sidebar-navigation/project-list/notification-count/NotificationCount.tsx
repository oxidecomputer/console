import React, { FC } from 'react'
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
  background-color: ${({ theme }) => theme.themeColors.yellow500};

  border: 1px solid hsla(203, 12, 13, 1);
  border-radius: 50%;
`

const Count = styled(Text).attrs({
  font: 'mono',
  weight: 400,
  size: 'xs',
})`
  position: relative;
  bottom: 1px;

  color: ${({ theme }) => theme.themeColors.yellow900};
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
