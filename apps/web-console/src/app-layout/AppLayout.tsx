import React from 'react'
import styled from 'styled-components'

import { useApiData, api } from '@oxide/api'
import { GlobalNav, OperationList, ProjectList } from '@oxide/ui'
import Wordmark from '../assets/wordmark.svg'

interface AppLayoutProps {
  children: React.ReactNode
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 14rem auto;
  grid-template-rows: 3.5rem auto;
  grid-template-areas:
    'logo globalnav'
    'sidebar content';
  height: 100vh;

  background-color: ${({ theme }) => theme.color('gray800')};
`

const Sidebar = styled.div`
  grid-area: sidebar;
  margin-left: ${({ theme }) => theme.spacing(4)};
  margin-right: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  overflow: auto;

  ${({ theme }) => theme.spaceBetweenY(6)};
`

const WordmarkWrapper = styled.div`
  align-items: center;
  grid-area: logo;
  display: flex;
  height: ${({ theme }) => theme.spacing(14)};
  padding-left: ${({ theme }) => theme.spacing(4)};
`

const Content = styled.main`
  grid-area: content;
  overflow: auto;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(6)};`};

  background-color: ${({ theme }) => theme.color('gray900')};
`

const GlobalNavContainer = styled.header`
  align-self: center;
  grid-area: globalnav;
  padding: ${({ theme }) => `${theme.spacing(4)} ${theme.spacing(6)};`};

  background-color: ${({ theme }) => theme.color('gray900')};
`

export default ({ children }: AppLayoutProps) => {
  const { data: projects } = useApiData(api, 'apiProjectsGet', {})

  return (
    <Wrapper>
      <WordmarkWrapper>
        <Wordmark />
      </WordmarkWrapper>
      <Sidebar>
        {/* TODO: this causes pop-in when the request comes back */}
        <ProjectList projects={projects?.items || []} />
        <OperationList />
      </Sidebar>
      <GlobalNavContainer>
        <GlobalNav />
      </GlobalNavContainer>
      <Content>{children}</Content>
    </Wrapper>
  )
}
