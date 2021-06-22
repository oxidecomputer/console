import React from 'react'
import tw, { styled } from 'twin.macro'
import { Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { GlobalNav } from '../components/global-nav/GlobalNav'
import { ProjectList } from '../components/project-list/ProjectList'
import { OperationList } from '../components/operation-list/OperationList'
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
`

const Sidebar = tw.div`grid-area[sidebar] px-3 pb-6 overflow-auto text-grey-1 bg-grey-5`

const WordmarkWrapper = tw.div`grid-area[logo] flex items-center h-14 pl-4 bg-grey-5`

const Content = tw.main`grid-area[content] overflow-auto py-2 px-6`

const GlobalNavContainer = tw.header`grid-area[globalnav] py-4 px-6 self-center`

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
        <ProjectList tw="mt-1" projects={projects?.items || []} />
        <OperationList tw="mt-6" />
      </Sidebar>
      <GlobalNavContainer>
        <GlobalNav />
      </GlobalNavContainer>
      <Content>{children}</Content>
    </Wrapper>
  )
}
