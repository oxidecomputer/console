import React from 'react'
import type { UseMatchesMatch } from '@remix-run/router'
import { Navigate, Route } from 'react-router-dom'

import { RouterDataErrorBoundary } from './components/ErrorBoundary'
import LoginPage from './pages/LoginPage'
import {
  AccessPage,
  DisksPage,
  InstancePage,
  InstancesPage,
  ImagesPage,
  SnapshotsPage,
  VpcPage,
  VpcsPage,
} from './pages/project'
import ProjectsPage from './pages/ProjectsPage'
import OrgsPage from './pages/OrgsPage'
import ToastTestPage from './pages/ToastTestPage'
import NotFound from './pages/NotFound'

import RootLayout from './layouts/RootLayout'
import OrgLayout from './layouts/OrgLayout'
import ProjectLayout from './layouts/ProjectLayout'
import AuthLayout from './layouts/AuthLayout'
import {
  Access24Icon,
  Instances24Icon,
  Images24Icon,
  Snapshots24Icon,
  Storage24Icon,
  Networking24Icon,
  Folder24Icon,
} from '@oxide/ui'
import { FormPage } from './components/FormPage'
import { ProfilePage } from './pages/settings/ProfilePage'
import SettingsLayout from './layouts/SettingsLayout'
import { AppearancePage } from './pages/settings/AppearancePage'
import { SSHKeysPage } from './pages/settings/SSHKeysPage'
import { HotkeysPage } from './pages/settings/HotkeysPage'

const OrgCreateForm = React.lazy(() => import('./forms/org-create'))
const ProjectCreateForm = React.lazy(() => import('./forms/project-create'))
const InstanceCreateForm = React.lazy(() => import('./forms/instance-create'))
const VpcCreateForm = React.lazy(() => import('./forms/vpc-create'))
const DiskCreateForm = React.lazy(() => import('./forms/disk-create'))

const orgCrumb = (m: UseMatchesMatch) => m.params.orgName!
const projectCrumb = (m: UseMatchesMatch) => m.params.projectName!
const instanceCrumb = (m: UseMatchesMatch) => m.params.instanceName!
const vpcCrumb = (m: UseMatchesMatch) => m.params.vpcName!

export const routes = (
  <>
    <Route path="*" element={<NotFound />} />
    <Route path="spoof_login" element={<AuthLayout />}>
      <Route index element={<LoginPage />} />
    </Route>

    <Route index element={<Navigate to="/orgs" replace />} />

    <Route path="orgs" errorElement={<RouterDataErrorBoundary />}>
      <Route
        element={<RootLayout />}
        handle={{ icon: <Folder24Icon />, title: 'Organizations' }}
      >
        <Route index element={<OrgsPage />} />
        <Route
          path="new"
          handle={{ title: 'Create organization' }}
          element={<FormPage Form={OrgCreateForm} />}
        />
      </Route>

      <Route path=":orgName" handle={{ title: orgCrumb, icon: <Folder24Icon /> }}>
        <Route index element={<Navigate to="projects" replace />} />
        <Route path="projects" handle={{ title: 'Projects' }}>
          {/* ORG */}
          <Route element={<OrgLayout />}>
            <Route index element={<ProjectsPage />} />
            <Route
              path="new"
              element={<FormPage Form={ProjectCreateForm} />}
              handle={{ title: 'Create project' }}
            />
          </Route>

          {/* PROJECT */}
          <Route
            path=":projectName"
            element={<ProjectLayout />}
            handle={{ title: projectCrumb }}
          >
            <Route index element={<Navigate to="instances" replace />} />
            <Route
              path="instances"
              handle={{ title: 'Instances', icon: <Instances24Icon /> }}
            >
              <Route index element={<InstancesPage />} />
              <Route
                path="new"
                element={<FormPage Form={InstanceCreateForm} />}
                handle={{ title: 'Create instance', icon: <Instances24Icon /> }}
              />
              <Route
                path=":instanceName"
                // layout has to be here instead of one up because it handles
                // the breadcrumbs, which need instanceName to be defined
                element={<InstancePage />}
                handle={{ title: instanceCrumb }}
              />
            </Route>
            <Route path="vpcs" handle={{ title: 'VPCs', icon: <Networking24Icon /> }}>
              <Route index element={<VpcsPage />} />
              <Route
                path="new"
                handle={{ title: 'Create VPC' }}
                element={<FormPage Form={VpcCreateForm} />}
              />
              <Route path=":vpcName" element={<VpcPage />} handle={{ title: vpcCrumb }} />
            </Route>
            <Route path="disks" handle={{ title: 'Disks', icon: <Storage24Icon /> }}>
              <Route index element={<DisksPage />} />
              <Route
                path="new"
                element={<FormPage Form={DiskCreateForm} />}
                handle={{ title: 'Create disk', icon: <Storage24Icon /> }}
              />
            </Route>
            <Route
              path="snapshots"
              element={<SnapshotsPage />}
              handle={{ title: 'Snapshots', icon: <Snapshots24Icon /> }}
            />
            <Route path="audit" handle={{ title: 'Audit' }} />
            <Route
              path="images"
              element={<ImagesPage />}
              handle={{ title: 'Images', icon: <Images24Icon /> }}
            />
            <Route
              path="access"
              element={<AccessPage />}
              handle={{ title: 'Access & IAM', icon: <Access24Icon /> }}
            />
            <Route path="settings" handle={{ title: 'Settings' }} />
          </Route>
        </Route>
      </Route>
    </Route>

    <Route path="settings" handle={{ title: 'settings' }} element={<SettingsLayout />}>
      <Route index element={<Navigate to="profile" replace />} />
      <Route path="profile" element={<ProfilePage />} handle={{ title: 'Profile' }} />
      <Route
        path="appearance"
        element={<AppearancePage />}
        handle={{ title: 'Appearance' }}
      />
      <Route path="ssh-keys" element={<SSHKeysPage />} handle={{ title: 'SSH Keys' }} />
      <Route path="hotkeys" element={<HotkeysPage />} handle={{ title: 'Hotkeys' }} />
    </Route>

    <Route path="__debug" element={<RootLayout />}>
      <Route path="toasts" element={<ToastTestPage />} handle={{ title: 'toasts' }} />
    </Route>
  </>
)
