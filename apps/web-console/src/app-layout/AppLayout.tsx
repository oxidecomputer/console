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
  height: 100vh;
`

const Sidebar = styled.div`
  grid-area: sidebar;
  overflow: auto;
  padding-left: ${({ theme }) => theme.spacing(4)};
  padding-right: ${({ theme }) => theme.spacing(4)};

  background-color: ${({ theme }) => theme.color('gray800')};
`

const WordmarkWrapper = styled.div`
  z-index: 1;
  position: sticky;
  top: 0;

  display: flex;
  align-items: center;
  height: ${({ theme }) => theme.spacing(14)};

  background-color: ${({ theme }) => theme.color('gray800')};
`

const SidebarLists = styled.div`
  ${({ theme }) => theme.spaceBetweenY(6)};
`

const Content = styled.main`
  grid-area: content;
  overflow: auto;

  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(6)};`};
`

const GlobalNavContainer = styled.header`
  position: sticky;
  top: 0;

  align-self: center;
  grid-area: topnav;
  padding: ${({ theme }) => `${theme.spacing(4)} ${theme.spacing(6)};`};

  background-color: ${({ theme }) => theme.color('gray900')};
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
