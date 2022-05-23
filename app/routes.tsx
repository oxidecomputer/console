import React from 'react'
import type { RouteMatch } from 'react-router-dom'
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

/*
 * We are doing something a little unorthodox with the route config here. We
 * realized that tagging nodes in the route tree with arbitrary data is very
 * powerful. It lets us handle breadcrumbs in a very straightforward way. Every
 * chunk of route that we want to be represented in the breadcrumbs gets a
 * `crumb` prop. Then, in order to get the breadcrumbs for a route, all we need
 * to do is find the path down the tree to the current route, and each node
 * becomes a crumb, where the `crumb` prop gives the label, and the path for
 * that node gives the path.
 *
 * The config ends up being a bit more complicated that it would otherwise be
 * because, e.g., we have to do `orgs` and `:orgName` separately in order to get
 * a crumb for each; `orgs/:orgName` would otherwise be ok.
 *
 * Note that `crumb` is defined via patched react-router types in
 * `types/react-router.d.ts`
 */

const orgCrumb = (m: RouteMatch) => m.params.orgName!
const projectCrumb = (m: RouteMatch) => m.params.projectName!
const instanceCrumb = (m: RouteMatch) => m.params.instanceName!
const vpcCrumb = (m: RouteMatch) => m.params.vpcName!

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
          handle={{ title: 'Create Organization' }}
          element={<FormPage Form={OrgCreateForm} />}
        />
      </Route>

      <Route path=":orgName" handle={{ crumb: orgCrumb, icon: <Folder24Icon /> }}>
        <Route index element={<Navigate to="projects" replace />} />
        <Route path="projects" handle={{ crumb: 'Projects' }}>
          {/* ORG */}
          <Route element={<OrgLayout />}>
            <Route index element={<ProjectsPage />} />
            <Route
              path="new"
              element={<FormPage Form={ProjectCreateForm} />}
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
            <Route
              path="instances"
              handle={{ crumb: 'Instances', icon: <Instances24Icon /> }}
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
                handle={{ crumb: instanceCrumb }}
              />
            </Route>
            <Route path="vpcs" handle={{ crumb: 'VPCs', icon: <Networking24Icon /> }}>
              <Route index element={<VpcsPage />} />
              <Route
                path="new"
                handle={{ title: 'Create VPC' }}
                element={<FormPage Form={VpcCreateForm} />}
              />
              <Route path=":vpcName" element={<VpcPage />} handle={{ title: vpcCrumb }} />
            </Route>
            <Route path="disks" handle={{ crumb: 'Disks', icon: <Storage24Icon /> }}>
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
              handle={{ crumb: 'Snapshots', icon: <Snapshots24Icon /> }}
            />
            <Route path="audit" handle={{ crumb: 'Audit' }} />
            <Route
              path="images"
              element={<ImagesPage />}
              handle={{ crumb: 'Images', icon: <Images24Icon /> }}
            />
            <Route
              path="access"
              element={<AccessPage />}
              handle={{ crumb: 'Access & IAM', icon: <Access24Icon /> }}
            />
            <Route path="settings" handle={{ crumb: 'Settings' }} />
          </Route>
        </Route>
      </Route>
    </Route>

    <Route path="settings" handle={{ crumb: 'settings' }} element={<SettingsLayout />}>
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
