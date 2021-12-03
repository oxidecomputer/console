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
import { Sidebar, NavLink } from '../components/Sidebar'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { InstancePageHeader } from '../components/InstancePageHeader'

const InstanceLayout = () => {
  return (
    <PageContainer>
      <Sidebar>
        <Sidebar.Nav heading="Instance">
          <NavLink to="" end>
            <Dashboard16Icon title="Overview" /> Overview
          </NavLink>
          <NavLink to="metrics">
            <Metrics16Icon /> Metrics
          </NavLink>
          <NavLink to="activity">
            <Document16Icon title="Activity" /> Activity
          </NavLink>
          <NavLink to="access">
            <Access16Icon /> Access &amp; IAM
          </NavLink>
          <NavLink to="resize">
            <Resize16Icon /> Resize
          </NavLink>
          <NavLink to="networking">
            <Networking16Icon /> Networking
          </NavLink>
          <NavLink to="storage">
            <Storage16Icon /> Storage
          </NavLink>
          <NavLink to="tags">
            <Tags16Icon /> Tags
          </NavLink>
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
