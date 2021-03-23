import React from 'react'

import styled from 'styled-components'

import { Tabs } from '@oxide/ui'
import { InstancePageTables } from './InstancePageTables'

const Wrapper = styled.div``

const StyledMain = styled.main`
  padding: 0 ${({ theme }) => theme.spacing(6)};
`

const OverviewPanel = styled.div``

export const App = () => {
  return (
    <Wrapper>
      <StyledMain>
        <Tabs
          label="Instance Page"
          tabs={['Overview', 'Metrics', 'Activity', 'Access & IAM', 'Settings']}
        >
          <OverviewPanel>
            <InstancePageTables />
          </OverviewPanel>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </Tabs>
      </StyledMain>
    </Wrapper>
  )
}

export default App
