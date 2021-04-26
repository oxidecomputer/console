import type { FC } from 'react'
import React from 'react'
import styled from 'styled-components'
import Text from '../../../text/Text'

const HintContainer = styled.div`
  flex: 1;
  padding-bottom: ${({ theme }) => theme.spacing(2)};

  color: ${({ theme }) => theme.color('gray300')};
`

export const Hint: FC<{ id: string }> = ({ id, children }) => (
  <HintContainer id={id}>
    <Text size="sm" weight={500}>
      {children}
    </Text>
  </HintContainer>
)
