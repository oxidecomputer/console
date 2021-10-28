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
            <InstancesMediumIcon /> Instances
          </NavLinkItem>
          <NavLinkItem to="networking">
            <NetworkingMediumIcon /> Networking
          </NavLinkItem>
          <NavLinkItem to="storage">
            <StorageMediumIcon /> Storage
          </NavLinkItem>
          <NavLinkItem to="metrics">
            <MetricsMediumIcon /> Metrics
          </NavLinkItem>
          <NavLinkItem to="audit">
            <DocumentMediumIcon title="Audit Log" /> Audit log
          </NavLinkItem>
          <NavLinkItem to="access">
            <AccessMediumIcon title="Access & IAM" /> Access &amp; IAM
          </NavLinkItem>
          <NavLinkItem to="settings">
            <SettingsMediumIcon /> Settings
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
