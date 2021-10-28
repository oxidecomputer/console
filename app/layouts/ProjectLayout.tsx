import React from 'react'
import { Outlet } from 'react-router-dom'

import {
  SkipLinkTarget,
  AccessMediumIcon,
  DashboardMediumIcon,
  DocumentMediumIcon,
  InstancesMediumIcon,
  MetricsMediumIcon,
  NetworkingMediumIcon,
  SettingsMediumIcon,
  StorageMediumIcon,
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
  const { projectName } = useParams('projectName')
  return (
    <PageContainer>
      <Sidebar>
        <Picker category="Project" resource={projectName} />
        <SidebarDivider />
        <NavList>
          <NavLinkItem to="">
            <DashboardMediumIcon title="Overview" /> Overview
          </NavLinkItem>
          <NavLinkItem to="instances">
            <InstancesMediumIcon title="Instances" /> Instances
          </NavLinkItem>
          <NavLinkItem to="networking">
            <NetworkingMediumIcon title="Networking" /> Networking
          </NavLinkItem>
          <NavLinkItem to="storage">
            <StorageMediumIcon title="Storage" /> Storage
          </NavLinkItem>
          <NavLinkItem to="metrics">
            <MetricsMediumIcon title="Metrics" /> Metrics
          </NavLinkItem>
          <NavLinkItem to="audit">
            <DocumentMediumIcon title="Audit Log" /> Audit log
          </NavLinkItem>
          <NavLinkItem to="access">
            <AccessMediumIcon title="Access & IAM" /> Access &amp; IAM
          </NavLinkItem>
          <NavLinkItem to="settings">
            <SettingsMediumIcon title="Settings" /> Settings
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
