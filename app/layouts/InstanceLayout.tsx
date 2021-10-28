import React from 'react'
import { Outlet } from 'react-router-dom'

import {
  SkipLinkTarget,
  AccessMediumIcon,
  DashboardMediumIcon,
  DocumentMediumIcon,
  MetricsMediumIcon,
  NetworkingMediumIcon,
  ResizeMediumIcon,
  StorageMediumIcon,
  TagsMediumIcon,
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
import { InstancePageHeader } from '../components/InstancePageHeader'
import { useParams } from '../hooks'

const InstanceLayout = () => {
  const { instanceName } = useParams('instanceName')
  return (
    <PageContainer>
      <Sidebar>
        <Picker category="Instance" resource={instanceName} />
        <SidebarDivider />
        <NavList>
          <NavLinkItem to="">
            <DashboardMediumIcon title="Overview" /> Overview
          </NavLinkItem>
          <NavLinkItem to="metrics">
            <MetricsMediumIcon title="Metrics" /> Metrics
          </NavLinkItem>
          <NavLinkItem to="activity">
            <DocumentMediumIcon title="Activity" /> Activity
          </NavLinkItem>
          <NavLinkItem to="access">
            <AccessMediumIcon title="Access" /> Access &amp; IAM
          </NavLinkItem>
          <NavLinkItem to="resize">
            <ResizeMediumIcon title="Resize" /> Resize
          </NavLinkItem>
          <NavLinkItem to="networking">
            <NetworkingMediumIcon title="Networking" /> Networking
          </NavLinkItem>
          <NavLinkItem to="storage">
            <StorageMediumIcon title="Storage" /> Storage
          </NavLinkItem>
          <NavLinkItem to="tags">
            <TagsMediumIcon title="tags" /> Tags
          </NavLinkItem>
        </NavList>
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
