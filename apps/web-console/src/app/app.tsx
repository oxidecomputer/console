import React from 'react'
import styled from 'styled-components'

import { Breadcrumbs, Text } from '@oxide/ui'

const Wrapper = styled.div`
  padding: ${(props) => props.theme.spacing(4)}
    ${(props) => props.theme.spacing(6)};
`

const GlobalNav = styled.nav`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-end;

  color: ${(props) => props.theme.themeColors.green50};
  text-transform: uppercase;

  > * + * {
    margin-left: ${(props) => props.theme.spacing(6)};
  }

  > :nth-child(2) {
    margin-left: ${(props) => props.theme.spacing(12)};
  }
`

const Title = styled(Text)`
  margin: ${(props) => props.theme.spacing(2)} 0 0 0;

  color: ${(props) => props.theme.themeColors.green500};
  text-transform: uppercase;
`

export const App = () => {
  return (
    <Wrapper>
      <header>
        <GlobalNav>
          <Text size="sm">Feedback?</Text>
          <Text size="sm">Theme Icon</Text>
          <Text size="sm">Support Icon</Text>
          <Text size="sm">Console Icon</Text>
          <Text size="sm">Notifications Icon</Text>
          <Text size="sm">Avatar</Text>
        </GlobalNav>
        <Breadcrumbs
          data={[
            { href: '#orgs', label: 'Organizations' },
            { label: 'Colossal Cave Adventure' },
          ]}
        />
      </header>
      <main>
        <Title as="h1" size="2xl">
          <Text size="sm">Folders Icon</Text>
          Projects
        </Title>
      </main>
    </Wrapper>
  )
}

export default App
