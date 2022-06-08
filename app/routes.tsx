import React from 'react'
import { DataBrowserRouter, Navigate, Route } from 'react-router-dom'

import { Folder24Icon, Instances24Icon, Networking24Icon, Storage24Icon } from '@oxide/ui'

import type { CrumbFunc } from './components/Breadcrumbs'
import { RouterDataErrorBoundary } from './components/ErrorBoundary'
import { FormPage } from './components/FormPage'
import AuthLayout from './layouts/AuthLayout'
import OrgLayout from './layouts/OrgLayout'
import ProjectLayout from './layouts/ProjectLayout'
import RootLayout from './layouts/RootLayout'
import SettingsLayout from './layouts/SettingsLayout'
import LoginPage from './pages/LoginPage'
import NotFound from './pages/NotFound'
import OrgsPage from './pages/OrgsPage'
import ProjectsPage from './pages/ProjectsPage'
import {
  AccessPage,
  DisksPage,
  ImagesPage,
  InstancePage,
  InstancesPage,
  SnapshotsPage,
  VpcPage,
  VpcsPage,
} from './pages/project'
import { AppearancePage } from './pages/settings/AppearancePage'
import { HotkeysPage } from './pages/settings/HotkeysPage'
import { ProfilePage } from './pages/settings/ProfilePage'
import { SSHKeysPage } from './pages/settings/SSHKeysPage'

const OrgCreateForm = React.lazy(() => import('./forms/org-create'))
const ProjectCreateForm = React.lazy(() => import('./forms/project-create'))
const InstanceCreateForm = React.lazy(() => import('./forms/instance-create'))
const VpcCreateForm = React.lazy(() => import('./forms/vpc-create'))
const DiskCreateForm = React.lazy(() => import('./forms/disk-create'))

const orgCrumb: CrumbFunc = (m) => m.params.orgName!
const projectCrumb: CrumbFunc = (m) => m.params.projectName!
const instanceCrumb: CrumbFunc = (m) => m.params.instanceName!
const vpcCrumb: CrumbFunc = (m) => m.params.vpcName!

export const Router = () => (
  <DataBrowserRouter fallbackElement={<span>loading</span>}>
    <Route path="*" element={<NotFound />} />
    <Route path="spoof_login" element={<AuthLayout />}>
      <Route index element={<LoginPage />} />
    </Route>

    <Route index element={<Navigate to="/orgs" replace />} />

    <Route path="orgs" errorElement={<RouterDataErrorBoundary />}>
      <Route element={<RootLayout />}>
        <Route index element={<OrgsPage />} />
        <Route
          path="new"
          element={
            <FormPage
              Form={OrgCreateForm}
              title="Create organization"
              icon={<Folder24Icon />}
            />
          }
        />
      </Route>

      <Route path=":orgName" handle={{ crumb: orgCrumb }}>
        <Route index element={<Navigate to="projects" replace />} />
        <Route path="projects" handle={{ crumb: 'Projects' }}>
          {/* ORG */}
          <Route element={<OrgLayout />}>
            <Route index element={<ProjectsPage />} />
            <Route
              path="new"
              element={<FormPage Form={ProjectCreateForm} title="Create project" />}
              handle={{ crumb: 'Create project' }}
            />
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
              <Route
                path="new"
                element={
                  <FormPage
                    Form={InstanceCreateForm}
                    title="Create instance"
                    icon={<Instances24Icon />}
                  />
                }
              />
              <Route
                path=":instanceName"
                element={<InstancePage />}
                handle={{ crumb: instanceCrumb }}
              />
            </Route>
            <Route path="vpcs" handle={{ crumb: 'VPCs' }}>
              <Route index element={<VpcsPage />} />
              <Route
                path="new"
                element={
                  <FormPage
                    Form={VpcCreateForm}
                    title="Create VPC"
                    icon={<Networking24Icon />}
                  />
                }
              />
              <Route path=":vpcName" element={<VpcPage />} handle={{ crumb: vpcCrumb }} />
            </Route>
            <Route path="disks" handle={{ crumb: 'Disks' }}>
              <Route index element={<DisksPage />} />
              <Route
                path="new"
                element={
                  <FormPage
                    Form={DiskCreateForm}
                    goToCreatedPage={false}
                    title="Create disk"
                    icon={<Storage24Icon />}
                  />
                }
              />
            </Route>
            <Route
              path="snapshots"
              element={<SnapshotsPage />}
              handle={{ crumb: 'Snapshots' }}
            />
            <Route path="images" element={<ImagesPage />} handle={{ crumb: 'Images' }} />
            <Route
              path="access"
              element={<AccessPage />}
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
