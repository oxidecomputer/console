import React from 'react'
import { Outlet } from 'react-router-dom'

import {
  SkipLinkTarget,
  Access16Icon,
  Dashboard16Icon,
  Document16Icon,
  Instances16Icon,
  Metrics16Icon,
  Networking16Icon,
  Settings16Icon,
  Storage16Icon,
} from '@oxide/ui'
import {
  ContentPane,
  NavLinkItem,
  NavList,
  PageContainer,
  Picker,
  Sidebar,
  SidebarDivider,
} from './helpers'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { useParams } from '../hooks'

const ProjectLayout = () => {
  const { orgName, projectName } = useParams('orgName', 'projectName')
  return (
    <PageContainer>
      <Sidebar>
        <Picker
          category="Project"
          resource={projectName}
          backTo={`/orgs/${orgName}`}
        />
        <SidebarDivider />
        <NavList>
          <NavLinkItem to="" end>
            <Dashboard16Icon title="Overview" /> Overview
          </NavLinkItem>
          <NavLinkItem to="instances">
            <Instances16Icon /> Instances
          </NavLinkItem>
          <NavLinkItem to="vpcs">
            <Networking16Icon /> Networking
          </NavLinkItem>
          <NavLinkItem to="storage">
            <Storage16Icon /> Storage
          </NavLinkItem>
          <NavLinkItem to="metrics">
            <Metrics16Icon /> Metrics
          </NavLinkItem>
          <NavLinkItem to="audit">
            <Document16Icon title="Audit Log" /> Audit log
          </NavLinkItem>
          <NavLinkItem to="access">
            <Access16Icon title="Access & IAM" /> Access &amp; IAM
          </NavLinkItem>
          <NavLinkItem to="settings">
            <Settings16Icon /> Settings
          </NavLinkItem>
        </NavList>
      </Sidebar>
      <ContentPane>
        <Breadcrumbs />
        <SkipLinkTarget />
        <Outlet />
      </ContentPane>
    </PageContainer>
  )
}

export default ProjectLayout
