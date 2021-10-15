import React from 'react'
import { Outlet } from 'react-router-dom'

import { Icon, SkipLinkTarget } from '@oxide/ui'
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
  const { projectName } = useParams('projectName')
  return (
    <PageContainer>
      <Sidebar>
        <Picker category="Project" resource={projectName} />
        <SidebarDivider />
        <NavList>
          <NavLinkItem to="">
            <Icon name="dashboard" /> Overview
          </NavLinkItem>
          <NavLinkItem to="instances">
            <Icon name="instances" /> Instances
          </NavLinkItem>
          <NavLinkItem to="networking">
            <Icon name="networking" /> Networking
          </NavLinkItem>
          <NavLinkItem to="storage">
            <Icon name="storage" /> Storage
          </NavLinkItem>
          <NavLinkItem to="metrics">
            <Icon name="metrics" /> Metrics
          </NavLinkItem>
          <NavLinkItem to="audit">
            <Icon name="document" /> Audit log
          </NavLinkItem>
          <NavLinkItem to="access">
            <Icon name="access" /> Access &amp; IAM
          </NavLinkItem>
          <NavLinkItem to="settings">
            <Icon name="settings" /> Settings
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
