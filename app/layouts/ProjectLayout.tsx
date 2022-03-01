import React, { useMemo } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import {
  SkipLinkTarget,
  Access16Icon,
  Instances16Icon,
  Metrics16Icon,
  Networking16Icon,
  Storage16Icon,
  Notification16Icon,
  Resize16Icon,
} from '@oxide/ui'
import {
  ContentPane,
  ContentPaneWrapper,
  PageContainer,
  PaginationContainer,
} from './helpers'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { TopBar } from '../components/TopBar'
import { Sidebar, NavLinkItem } from '../components/Sidebar'
import { useParams, useQuickActions } from 'app/hooks'

const ProjectLayout = () => {
  const navigate = useNavigate()
  const { projectName } = useParams('projectName')
  const navGroup = `Project '${projectName}'`
  useQuickActions(
    useMemo(
      () => [
        { navGroup, value: 'Instances', onSelect: () => navigate('instances') },
        { navGroup, value: 'Snapshots', onSelect: () => navigate('snapshots') },
        { navGroup, value: 'Disks', onSelect: () => navigate('disks') },
        { navGroup, value: 'Access & IAM', onSelect: () => navigate('access') },
        { navGroup, value: 'Networking', onSelect: () => navigate('vpcs') },
      ],
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    )
  )

  return (
    <PageContainer>
      <Sidebar>
        <Sidebar.Nav heading="project">
          <NavLinkItem to="instances">
            <Instances16Icon /> Instances
          </NavLinkItem>
          <NavLinkItem to="snapshots">
            <Notification16Icon /> Snapshots
          </NavLinkItem>
          <NavLinkItem to="disks">
            <Storage16Icon /> Disks
          </NavLinkItem>
          <NavLinkItem to="access">
            <Access16Icon title="Access & IAM" /> Access &amp; IAM
          </NavLinkItem>
          <NavLinkItem to="images">
            <Resize16Icon title="images" /> Images
          </NavLinkItem>
          <NavLinkItem to="vpcs">
            <Networking16Icon /> Networking
          </NavLinkItem>
          <NavLinkItem to="metrics">
            <Metrics16Icon /> Metrics
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPaneWrapper>
        <ContentPane>
          <TopBar />
          <Breadcrumbs />
          <SkipLinkTarget />
          <Outlet />
        </ContentPane>
        <PaginationContainer id="pagination-target" />
      </ContentPaneWrapper>
    </PageContainer>
  )
}

export default ProjectLayout
