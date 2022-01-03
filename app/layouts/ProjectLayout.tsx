import React from 'react'
import { Outlet } from 'react-router-dom'

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
import { Sidebar, NavLinkItem } from '../components/Sidebar'

const ProjectLayout = () => {
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
