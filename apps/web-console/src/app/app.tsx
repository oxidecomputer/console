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

  color: ${(props) => props.theme.themeColors.green50};
  text-transform: uppercase;

  > * + * {
    margin-left: ${(props) => props.theme.spacing(6)};
  }

  > :nth-child(2) {
    margin-left: ${(props) => props.theme.spacing(12)};
  }
`

const Breadcrumbs = styled.div`
  padding-top: ${(props) => props.theme.spacing(4)};

  color: ${(props) => props.theme.themeColors.gray100};
  text-transform: uppercase;
`

const Title = styled(Text)`
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
        <Breadcrumbs>
          <ol>
            <li>
              <Text size="sm">Colossal Cave Adventure</Text>
            </li>
            <li>
              <Text size="sm">Projects</Text>
            </li>
          </ol>
        </Breadcrumbs>
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
