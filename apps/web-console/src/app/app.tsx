import React from 'react'
import styled from 'styled-components'

import { Text } from '@oxide/ui'

const Wrapper = styled.div``

const GlobalNav = styled.nav`
  text-align: right;
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
