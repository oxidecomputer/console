import React from 'react'
import { Navigate, Route, createRoutesFromElements } from 'react-router-dom'

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

export const routes = createRoutesFromElements(
  <>
    <Route path="*" element={<NotFound />} />
    <Route path="spoof_login" element={<AuthLayout />}>
      <Route index element={<LoginPage />} />
    </Route>

    {/* TODO: prefetch sessionMe in a loader on a route wrapping all relevant pages, handle possible 401 */}
    <Route path="device" element={<AuthLayout />}>
      <Route path="verify" element={<DeviceAuthVerifyPage />} />
      <Route path="success" element={<DeviceAuthSuccessPage />} />
    </Route>

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

    <Route index element={<Navigate to="/orgs" replace />} />

    {/* These are done here instead of nested so we don't flash a layout on 404s */}
    <Route path="/orgs/:orgName" element={<Navigate to="projects" replace />} />
    <Route
      path="/orgs/:orgName/projects/:projectName"
      element={<Navigate to="instances" replace />}
    />

    <Route path="orgs" errorElement={<RouterDataErrorBoundary />}>
      <Route element={<RootLayout />}>
        <Route index element={<OrgsPage />} loader={OrgsPage.loader} />
        <Route
          path="new"
          element={<OrgsPage modal="createOrg" />}
          loader={OrgsPage.loader}
        />
        <Route path="edit">
          <Route
            path=":orgName"
            element={<OrgsPage modal="editOrg" />}
            loader={OrgsPage.loader}
          />
        </Route>
      </Route>

      <Route path=":orgName" handle={{ crumb: orgCrumb }}>
        <Route element={<OrgLayout />}>
          <Route
            path="access"
            element={<OrgAccessPage />}
            loader={OrgAccessPage.loader}
            handle={{ crumb: 'Access & IAM' }}
          />
        </Route>
        <Route path="projects" handle={{ crumb: 'Projects' }}>
          {/* ORG */}
          <Route element={<OrgLayout />}>
            <Route index element={<ProjectsPage />} loader={ProjectsPage.loader} />
            <Route
              path="new"
              element={<ProjectsPage modal="createProject" />}
              loader={ProjectsPage.loader}
            />
            <Route path="edit">
              <Route
                path=":projectName"
                element={<ProjectsPage modal="editProject" />}
                loader={ProjectsPage.loader}
              />
            </Route>
          </Route>

          {/* PROJECT */}
          <Route
            path=":projectName"
            element={<ProjectLayout />}
            handle={{ crumb: projectCrumb }}
          >
            <Route path="instances" handle={{ crumb: 'Instances' }}>
              <Route index element={<InstancesPage />} loader={InstancesPage.loader} />
              <Route path="new" element={<FormPage Form={InstanceCreateForm} />} />
              <Route path=":instanceName" handle={{ crumb: instanceCrumb }}>
                <Route index element={<InstancePage />} loader={InstancePage.loader} />
                <Route
                  path="serial-console"
                  element={<SerialConsolePage />}
                  handle={{ crumb: 'serial-console' }}
                />
              </Route>
            </Route>
            <Route path="vpcs" handle={{ crumb: 'VPCs' }}>
              <Route index element={<VpcsPage />} loader={VpcsPage.loader} />
              <Route
                path="new"
                element={<VpcsPage modal="createVpc" />}
                loader={VpcsPage.loader}
              />
              <Route path="edit">
                <Route
                  path=":vpcName"
                  element={<VpcsPage modal="editVpc" />}
                  loader={VpcsPage.loader}
                />
              </Route>
              <Route
                path=":vpcName"
                element={<VpcPage />}
                loader={VpcPage.loader}
                handle={{ crumb: vpcCrumb }}
              />
            </Route>
            <Route path="disks" handle={{ crumb: 'Disks' }}>
              <Route index element={<DisksPage />} loader={DisksPage.loader} />
              <Route
                path="new"
                element={<DisksPage modal="createDisk" />}
                loader={DisksPage.loader}
              />
            </Route>
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
  </>
)
