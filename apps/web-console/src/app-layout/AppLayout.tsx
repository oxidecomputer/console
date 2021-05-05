import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { GlobalNav, OperationList, ProjectList } from '@oxide/ui'
import Wordmark from '../assets/wordmark.svg'
import { color, spacing } from '@oxide/css-helpers'

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

  background-color: ${color('gray800')};
`

const Sidebar = styled.div`
  grid-area: sidebar;
  margin-left: ${spacing(4)};
  margin-right: ${spacing(4)};
  margin-bottom: ${spacing(6)};
  overflow: auto;
`

const WordmarkWrapper = styled.div`
  align-items: center;
  grid-area: logo;
  display: flex;
  height: ${spacing(14)};
  padding-left: ${spacing(4)};
`

const Content = styled.main`
  grid-area: content;
  overflow: auto;
  padding: ${spacing(2, 6)};

  background-color: ${color('gray900')};
`

const GlobalNavContainer = styled.header`
  align-self: center;
  grid-area: globalnav;
  padding: ${spacing(4, 6)};

  background-color: ${color('gray900')};
`

const StyledProjectList = styled(ProjectList)`
  margin-top: ${spacing(1)};
`

const StyledOperationList = styled(OperationList)`
  margin-top: ${spacing(6)};
`

export default ({ children }: AppLayoutProps) => {
  const { data: projects } = useApiQuery('apiProjectsGet', {})

  return (
    <Wrapper>
      <WordmarkWrapper>
        <Link to="/">
          <Wordmark />
        </Link>
      </WordmarkWrapper>
      <Sidebar>
        {/* TODO: this causes pop-in when the request comes back */}
        <StyledProjectList projects={projects?.items || []} />
        <StyledOperationList />
      </Sidebar>
      <GlobalNavContainer>
        <GlobalNav />
      </GlobalNavContainer>
      <Content>{children}</Content>
    </Wrapper>
  )
}
