import type { FC } from 'react'
import React from 'react'
import styled from 'styled-components'
import Text from '../../../text/Text'

const ErrorContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(2)};
`
export const ErrorMessage: FC<{ id: string }> = ({ id, children }) => (
  <ErrorContainer id={id}>
    <Text size="xs">{children}</Text>
  </ErrorContainer>
)
