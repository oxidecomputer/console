import React, { FC } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.primary};
  padding: 2em;
`

export const Component: FC = () => (
  <Container>This is a component from the component library</Container>
)
