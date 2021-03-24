import React from 'react'

import styled from 'styled-components'
import { GlobalNav, OperationList, ProjectList, Text } from '@oxide/ui'

interface AppLayoutProps {
  children: React.ReactNode
}

const projects = [
  {
    id: '1',
    name: 'prod-online',
    notificationsCount: 2,
    starred: true,
  },
  {
    id: '2',
    name: 'release-infrastructure',
  },
  {
    id: '3',
    name: 'rendering',
  },
  {
    id: '4',
    name: 'test-infrastructure',
  },
  {
    id: '5',
    name: 'oxide-demo',
  },
]

const Wrapper = styled.div`
  display: flex;
`

const Sidebar = styled.div`
  background-color: ${({ theme }) => theme.color('gray800')};
  padding: ${({ theme }) => theme.spacing(4)};
  width: 220px;
  min-height: 100vh;

  ${({ theme }) => theme.spaceBetweenY(6)};
`

const Main = styled.div`
  width: calc(100vw - 220px);
`

const Content = styled.div`
  padding: ${({ theme }) => theme.spacing(6)};
`

export default ({ children }: AppLayoutProps) => {
  return (
    <Wrapper>
      <Sidebar>
        <Text size="3xl" font="mono" weight={400} color="green500">
          0xide
        </Text>
        <ProjectList
          projects={projects}
          onProjectSelect={() => null}
          onProjectCreate={() => null}
        />
        <OperationList />
      </Sidebar>
      <Main>
        <GlobalNav />
        <Content>{children}</Content>
      </Main>
    </Wrapper>
  )
}
