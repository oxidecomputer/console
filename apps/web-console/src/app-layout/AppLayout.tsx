import React from 'react'

import styled from 'styled-components'
import { GlobalNav, OperationList, ProjectList } from '@oxide/ui'
import Wordmark from '../assets/wordmark.svg'

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
  display: grid;
  grid-template-columns: 14rem auto;
  grid-template-rows: 3.5rem auto;
  grid-template-areas:
    'sidebar topnav'
    'sidebar content';
  min-height: 100vh;
`

const Sidebar = styled.div`
  background-color: ${({ theme }) => theme.color('gray800')};
  grid-area: sidebar;
  padding-left: ${({ theme }) => theme.spacing(4)};
  padding-right: ${({ theme }) => theme.spacing(4)};
`

const WordmarkWrapper = styled.div`
  display: flex;
  align-items: center;
  height: ${({ theme }) => theme.spacing(14)};
`

const SidebarLists = styled.div`
  ${({ theme }) => theme.spaceBetweenY(6)};
`

const Content = styled.main`
  grid-area: content;
  ${({ theme }) => theme.marginX(6)}
  ${({ theme }) => theme.marginY(2)}
`

const GlobalNavContainer = styled.header`
  align-self: center;
  grid-area: topnav;
  ${({ theme }) => theme.marginX(6)}
`

export default ({ children }: AppLayoutProps) => {
  return (
    <Wrapper>
      <Sidebar>
        <WordmarkWrapper>
          <Wordmark />
        </WordmarkWrapper>
        <SidebarLists>
          <ProjectList
            projects={projects}
            onProjectSelect={() => null}
            onProjectCreate={() => null}
          />
          <OperationList />
        </SidebarLists>
      </Sidebar>
      <GlobalNavContainer>
        <GlobalNav />
      </GlobalNavContainer>
      <Content>{children}</Content>
    </Wrapper>
  )
}
