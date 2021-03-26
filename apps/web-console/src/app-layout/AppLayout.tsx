import React from 'react'

import styled from 'styled-components'
import { GlobalNav, OperationList, ProjectList } from '@oxide/ui'

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

const Wordmark = styled.div`
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
        <Wordmark>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="87"
            height="24"
            viewBox="0 0 87 24"
          >
            <g>
              <path
                fill="#48D597"
                d="M16.425 11.248v2.008c0 6.507-2.753 10.731-8.21 10.731-5.459 0-8.212-4.224-8.212-10.731v-2.008C.003 4.742 2.756.518 8.198.518c5.474 0 8.227 4.224 8.227 10.732zM2.837 13.256c0 1.192.096 2.268.284 3.218l9.621-10.313c-.864-2.072-2.39-3.184-4.528-3.184-3.498 0-5.377 2.978-5.377 8.271v2.008zm10.738-2.007c0-1.057-.074-2.022-.221-2.889L3.792 18.61c.887 1.901 2.378 2.918 4.422 2.918 3.498 0 5.36-2.978 5.36-8.271v-2.007zM33.334 7.315c.064-.081.194-.081.275-.016l1.587 1.489c.081.065.081.194.016.275l-5.96 6.345 5.96 6.345c.065.081.065.21-.016.276l-1.587 1.489c-.081.064-.21.064-.275-.016l-5.798-6.248-5.815 6.248c-.064.08-.194.08-.275.016l-1.587-1.49c-.081-.064-.081-.194-.016-.274l5.96-6.346-5.96-6.345c-.065-.08-.065-.21.016-.275l1.587-1.49c.081-.064.21-.064.275.017l5.815 6.248 5.798-6.248zM38.467 21.365c0-.13.065-.194.194-.194h4.826V9.646H39.31a.186.186 0 01-.194-.194V7.509c0-.13.064-.194.194-.194h6.737a.187.187 0 01.195.194v13.662h4.794a.187.187 0 01.194.194v1.943c0 .13-.065.194-.194.194H38.66c-.13 0-.194-.065-.194-.194v-1.943zM46.37 3.56c0 .13-.064.194-.194.194h-3.174c-.13 0-.195-.065-.195-.194V.387c0-.13.065-.194.195-.194h3.174c.13 0 .194.065.194.194V3.56zM67.457.03a.21.21 0 01.195.195v23.082a.209.209 0 01-.195.195h-2.202a.208.208 0 01-.194-.195v-2.622c-1.134 1.975-2.819 3.205-5.637 3.205-3.919 0-6.834-3.4-6.834-8.514 0-5.083 3.077-8.45 7.255-8.45 2.365 0 4.082 1.101 5.053 2.687V.225a.208.208 0 01.195-.194h2.364zm-2.494 15.055c0-3.497-1.878-5.73-4.696-5.73-2.948 0-4.762 2.265-4.762 6.02 0 3.756 1.782 6.087 4.664 6.087 2.883 0 4.794-2.266 4.794-5.795v-.582zM86.552 16.12H74.794c.064 3.043 1.846 5.342 4.826 5.342 2.17 0 3.563-1.23 4.438-2.72.064-.129.161-.161.291-.097l1.944 1.101c.13.065.161.194.064.324-1.522 2.493-3.627 3.82-6.608 3.82-5.085 0-7.773-3.496-7.773-8.806 0-4.953 3.044-8.158 7.58-8.158 4.955 0 6.996 3.723 6.996 7.705v1.49zm-2.786-2.266c0-2.59-1.425-4.791-4.34-4.791-2.948 0-4.568 2.428-4.632 4.791h8.972z"
              />
            </g>
          </svg>
        </Wordmark>
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
