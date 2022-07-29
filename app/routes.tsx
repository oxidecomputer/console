import React from 'react'
import { DataBrowserRouter, Navigate, Route } from 'react-router-dom'

import type { CrumbFunc } from './components/Breadcrumbs'
import { RouterDataErrorBoundary } from './components/ErrorBoundary'
import { FormPage } from './components/FormPage'
import AuthLayout from './layouts/AuthLayout'
import OrgLayout from './layouts/OrgLayout'
import ProjectLayout from './layouts/ProjectLayout'
import RootLayout from './layouts/RootLayout'
import SettingsLayout from './layouts/SettingsLayout'
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
import { SerialConsolePage } from './pages/project/instances/instance/SerialConsolePage'
import { AppearancePage } from './pages/settings/AppearancePage'
import { HotkeysPage } from './pages/settings/HotkeysPage'
import { ProfilePage } from './pages/settings/ProfilePage'
import { SSHKeysPage } from './pages/settings/SSHKeysPage'

const InstanceCreateForm = React.lazy(() => import('./forms/instance-create'))

const orgCrumb: CrumbFunc = (m) => m.params.orgName!
const projectCrumb: CrumbFunc = (m) => m.params.projectName!
const instanceCrumb: CrumbFunc = (m) => m.params.instanceName!
const vpcCrumb: CrumbFunc = (m) => m.params.vpcName!

export const Router = () => (
  <DataBrowserRouter fallbackElement={null}>
    <Route path="*" element={<NotFound />} />
    <Route path="spoof_login" element={<AuthLayout />}>
      <Route index element={<LoginPage />} />
    </Route>

    <Route path="device" element={<AuthLayout />}>
      <Route path="verify" element={<DeviceAuthVerifyPage />} />
      <Route path="success" element={<DeviceAuthSuccessPage />} />
    </Route>

    <Route index element={<Navigate to="/orgs" replace />} />

    <Route path="orgs" errorElement={<RouterDataErrorBoundary />}>
      <Route element={<RootLayout />}>
        <Route index element={<OrgsPage />} />
        <Route path="new" element={<OrgsPage modal="createOrg" />} />
        <Route path="edit">
          <Route path=":orgName" element={<OrgsPage modal="editOrg" />} />
        </Route>
      </Route>

      <Route path=":orgName" handle={{ crumb: orgCrumb }}>
        <Route index element={<Navigate to="projects" replace />} />
        <Route element={<OrgLayout />}>
          <Route
            path="access"
            element={<OrgAccessPage />}
            handle={{ crumb: 'Access & IAM' }}
          />
        </Route>
        <Route path="projects" handle={{ crumb: 'Projects' }}>
          {/* ORG */}
          <Route element={<OrgLayout />}>
            <Route index element={<ProjectsPage />} />
            <Route path="new" element={<ProjectsPage modal="createProject" />} />
            <Route path="edit">
              <Route path=":projectName" element={<ProjectsPage modal="editProject" />} />
            </Route>
          </Route>

          {/* PROJECT */}
          <Route
            path=":projectName"
            element={<ProjectLayout />}
            handle={{ crumb: projectCrumb }}
          >
            <Route index element={<Navigate to="instances" replace />} />
            <Route path="instances" handle={{ crumb: 'Instances' }}>
              <Route index element={<InstancesPage />} />
              <Route path="new" element={<FormPage Form={InstanceCreateForm} />} />
              <Route path=":instanceName" handle={{ crumb: instanceCrumb }}>
                <Route index element={<InstancePage />} />
                <Route
                  path="serial-console"
                  element={<SerialConsolePage />}
                  handle={{ crumb: 'serial-console' }}
                />
              </Route>
            </Route>
            <Route path="vpcs" handle={{ crumb: 'VPCs' }}>
              <Route index element={<VpcsPage />} />
              <Route path="new" element={<VpcsPage modal="createVpc" />} />
              <Route path="edit">
                <Route path=":vpcName" element={<VpcsPage modal="editVpc" />} />
              </Route>
              <Route
                path=":vpcName"
                element={<VpcPage />}
                loader={VpcPage.loader}
                handle={{ crumb: vpcCrumb }}
              />
            </Route>
            <Route path="disks" handle={{ crumb: 'Disks' }}>
              <Route index element={<DisksPage />} />
              <Route path="new" element={<DisksPage modal="createDisk" />} />
            </Route>
            <Route
              path="snapshots"
              element={<SnapshotsPage />}
              handle={{ crumb: 'Snapshots' }}
            />
            <Route path="images" element={<ImagesPage />} handle={{ crumb: 'Images' }} />
            <Route
              path="access"
              element={<ProjectAccessPage />}
              handle={{ crumb: 'Access & IAM' }}
            />
          </Route>
        </Route>
      </Route>
    </Route>

    <Route path="settings" handle={{ crumb: 'settings' }} element={<SettingsLayout />}>
      <Route index element={<Navigate to="profile" replace />} />
      <Route path="profile" element={<ProfilePage />} handle={{ crumb: 'Profile' }} />
      <Route
        path="appearance"
        element={<AppearancePage />}
        handle={{ crumb: 'Appearance' }}
      />
      <Route path="ssh-keys" element={<SSHKeysPage />} handle={{ crumb: 'SSH Keys' }} />
      <Route path="hotkeys" element={<HotkeysPage />} handle={{ crumb: 'Hotkeys' }} />
    </Route>
  </DataBrowserRouter>
)
