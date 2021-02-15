import React from 'react'
import styled from 'styled-components'

import { Text } from '@oxide/ui'

const Wrapper = styled.div`
  padding: ${(props) => props.theme.spacing(4)}
    ${(props) => props.theme.spacing(6)};
`

const GlobalNav = styled.nav`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-end;

  text-transform: uppercase;

  > * + * {
    margin-left: ${(props) => props.theme.spacing(6)};
  }

  > :nth-child(2) {
    margin-left: ${(props) => props.theme.spacing(12)};
  }
`

export const App = () => {
  return (
    <Wrapper>
      <header>
        <GlobalNav>
          <Text>Feedback?</Text>
          <Text>Theme Icon</Text>
          <Text>Support Icon</Text>
          <Text>Console Icon</Text>
          <Text>Notifications Icon</Text>
          <Text>Avatar</Text>
        </GlobalNav>
      </header>
      <main></main>
    </Wrapper>
  )
}

export default App
