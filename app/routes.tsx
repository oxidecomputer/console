import React from 'react'
import { Navigate, Route, createRoutesFromElements } from 'react-router-dom'

import { RouterDataErrorBoundary } from './components/ErrorBoundary'
import type { CrumbFunc } from './hooks/use-crumbs'
import AuthLayout from './layouts/AuthLayout'
import OrgLayout from './layouts/OrgLayout'
import ProjectLayout from './layouts/ProjectLayout'
import RootLayout from './layouts/RootLayout'
import SettingsLayout from './layouts/SettingsLayout'
import SiloLayout from './layouts/SiloLayout'
import SystemLayout from './layouts/SystemLayout'
import { prefetchSessionMe } from './layouts/helpers'
import DeviceAuthSuccessPage from './pages/DeviceAuthSuccessPage'
import DeviceAuthVerifyPage from './pages/DeviceAuthVerifyPage'
import LoginPage from './pages/LoginPage'
import NotFound from './pages/NotFound'
import { OrgAccessPage } from './pages/OrgAccessPage'
import OrgsPage from './pages/OrgsPage'
import ProjectsPage from './pages/ProjectsPage'
import {
  DisksPage,
  ImagesPage,
  InstancePage,
  InstancesPage,
  ProjectAccessPage,
  SnapshotsPage,
  VpcPage,
  VpcsPage,
} from './pages/project'
import { InstanceCreatePage } from './pages/project/instances/InstanceCreatePage'
import { SerialConsolePage } from './pages/project/instances/instance/SerialConsolePage'
import { AppearancePage } from './pages/settings/AppearancePage'
import { HotkeysPage } from './pages/settings/HotkeysPage'
import { ProfilePage } from './pages/settings/ProfilePage'
import { SSHKeysPage } from './pages/settings/SSHKeysPage'
import { pb } from './util/path-builder'

const orgCrumb: CrumbFunc = (m) => m.params.orgName!
const projectCrumb: CrumbFunc = (m) => m.params.projectName!
const instanceCrumb: CrumbFunc = (m) => m.params.instanceName!
const vpcCrumb: CrumbFunc = (m) => m.params.vpcName!

export const routes = createRoutesFromElements(
  <Route element={<RootLayout />}>
    <Route path="*" element={<NotFound />} />
    <Route path="spoof_login" element={<AuthLayout />}>
      <Route index element={<LoginPage />} />
    </Route>

    <Route path="device" element={<AuthLayout />}>
      <Route path="verify" element={<DeviceAuthVerifyPage />} />
      <Route path="success" element={<DeviceAuthSuccessPage />} />
    </Route>

    {/* This wraps all routes that are supposed to be authenticated */}
    <Route loader={prefetchSessionMe} errorElement={<RouterDataErrorBoundary />}>
      <Route path="settings" handle={{ crumb: 'settings' }} element={<SettingsLayout />}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<ProfilePage />} handle={{ crumb: 'Profile' }} />
        <Route
          path="appearance"
          element={<AppearancePage />}
          handle={{ crumb: 'Appearance' }}
        />
        <Route
          path="ssh-keys"
          element={<SSHKeysPage />}
          loader={SSHKeysPage.loader}
          handle={{ crumb: 'SSH Keys' }}
        />
        <Route path="hotkeys" element={<HotkeysPage />} handle={{ crumb: 'Hotkeys' }} />
      </Route>

      <Route path="system" element={<SystemLayout />}>
        <Route index element={null} />
        <Route path="issues" element={null} />
        <Route path="utilization" element={null} />
        <Route path="inventory" element={null} />
        <Route path="health" element={null} />
        <Route path="update" element={null} />
        <Route path="networking" element={null} />
        <Route path="settings" element={null} />
      </Route>

      <Route index element={<Navigate to={pb.orgs()} replace />} />

      {/* These are done here instead of nested so we don't flash a layout on 404s */}
      <Route path="orgs/:orgName" element={<Navigate to="projects" replace />} />
      <Route
        path="orgs/:orgName/projects/:projectName"
        element={<Navigate to="instances" replace />}
      />

      <Route element={<SiloLayout />}>
        <Route
          path="orgs"
          element={<OrgsPage />}
          loader={OrgsPage.loader}
          handle={{ crumb: 'Orgs' }}
        />
        <Route
          path="org-new"
          element={<OrgsPage modal="createOrg" />}
          loader={OrgsPage.loader}
          handle={{ crumb: 'New org' }}
        />
      </Route>

      <Route path="orgs/:orgName" handle={{ crumb: orgCrumb }}>
        <Route element={<OrgLayout />}>
          <Route
            path="access"
            element={<OrgAccessPage />}
            loader={OrgAccessPage.loader}
            handle={{ crumb: 'Access & IAM' }}
          />
          <Route
            path="edit"
            element={<OrgsPage modal="editOrg" />}
            loader={OrgsPage.loader}
            handle={{ crumb: 'Edit' }}
          />
          <Route
            path="project-new"
            element={<ProjectsPage modal="createProject" />}
            loader={ProjectsPage.loader}
            handle={{ crumb: 'New project' }}
          />
        </Route>

        <Route path="projects" handle={{ crumb: 'Projects' }}>
          {/* ORG */}
          <Route element={<OrgLayout />}>
            <Route index element={<ProjectsPage />} loader={ProjectsPage.loader} />
            <Route
              path=":projectName/edit"
              element={<ProjectsPage modal="editProject" />}
              loader={ProjectsPage.loader}
              handle={{ crumb: 'Edit' }}
            />
          </Route>

          {/* PROJECT */}
          <Route
            path=":projectName"
            element={<ProjectLayout />}
            handle={{ crumb: projectCrumb }}
          >
            <Route
              path="instance-new"
              element={<InstanceCreatePage />}
              handle={{ crumb: 'New instance' }}
            />
            <Route path="instances" handle={{ crumb: 'Instances' }}>
              <Route index element={<InstancesPage />} loader={InstancesPage.loader} />
              <Route path=":instanceName" handle={{ crumb: instanceCrumb }}>
                <Route index element={<InstancePage />} loader={InstancePage.loader} />
                <Route
                  path="serial-console"
                  element={<SerialConsolePage />}
                  handle={{ crumb: 'serial-console' }}
                />
              </Route>
            </Route>
            <Route
              path="vpc-new"
              element={<VpcsPage modal="createVpc" />}
              loader={VpcsPage.loader}
              handle={{ crumb: 'New VPC' }}
            />
            <Route
              path="disk-new"
              element={<DisksPage modal="createDisk" />}
              loader={DisksPage.loader}
              handle={{ crumb: 'New disk' }}
            />

            <Route path="vpcs" handle={{ crumb: 'VPCs' }}>
              <Route index element={<VpcsPage />} loader={VpcsPage.loader} />
              <Route path=":vpcName" handle={{ crumb: vpcCrumb }}>
                <Route index element={<VpcPage />} loader={VpcPage.loader} />
                <Route
                  path="edit"
                  element={<VpcsPage modal="editVpc" />}
                  loader={VpcsPage.loader}
                  handle={{ crumb: 'Edit' }}
                />
              </Route>
            </Route>
            <Route
              path="disks"
              element={<DisksPage />}
              loader={DisksPage.loader}
              handle={{ crumb: 'Disks' }}
            />
            <Route
              path="snapshots"
              element={<SnapshotsPage />}
              loader={SnapshotsPage.loader}
              handle={{ crumb: 'Snapshots' }}
            />
            <Route
              path="images"
              element={<ImagesPage />}
              loader={ImagesPage.loader}
              handle={{ crumb: 'Images' }}
            />
            <Route
              path="access"
              element={<ProjectAccessPage />}
              loader={ProjectAccessPage.loader}
              handle={{ crumb: 'Access & IAM' }}
            />
          </Route>
        </Route>
      </Route>
    </Route>
  </Route>
)
