import React from 'react'
import { Outlet } from 'react-router-dom'

import {
  SkipLinkTarget,
  Access16Icon,
  Dashboard16Icon,
  Document16Icon,
  Metrics16Icon,
  Networking16Icon,
  Resize16Icon,
  Storage16Icon,
  Tags16Icon,
} from '@oxide/ui'
import { ContentPane, PageContainer } from './helpers'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { InstancePageHeader } from '../components/InstancePageHeader'
import { Sidebar, NavLinkItem } from '../components/Sidebar'

const InstanceLayout = () => {
  return (
    <PageContainer>
      <Sidebar>
        <Sidebar.Nav heading="vpc">
          <NavLinkItem to="">
            <Dashboard16Icon title="Overview" /> Overview
          </NavLinkItem>
          <NavLinkItem to="metrics">
            <Metrics16Icon /> Metrics
          </NavLinkItem>
          <NavLinkItem to="activity">
            <Document16Icon title="Activity" /> Activity
          </NavLinkItem>
          <NavLinkItem to="access">
            <Access16Icon /> Access &amp; IAM
          </NavLinkItem>
          <NavLinkItem to="resize">
            <Resize16Icon /> Resize
          </NavLinkItem>
          <NavLinkItem to="vpcs">
            <Networking16Icon /> Networking
          </NavLinkItem>
          <NavLinkItem to="storage">
            <Storage16Icon /> Storage
          </NavLinkItem>
          <NavLinkItem to="tags">
            <Tags16Icon /> Tags
          </NavLinkItem>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPane>
        <Breadcrumbs />
        <SkipLinkTarget />
        <InstancePageHeader />
        <Outlet />
      </ContentPane>
    </PageContainer>
  )
}

// hot reload doesn't work with `export default () => ...` ???
export default InstanceLayout
