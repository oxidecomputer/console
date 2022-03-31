import React from 'react'

import type { RouteMatch, RouteObject } from 'react-router-dom'
import { Navigate, Route, Routes } from 'react-router-dom'

import LoginPage from './pages/LoginPage'
import InstanceCreatePage from './pages/project/instances/create/InstancesCreatePage'
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
  Image24Icon,
  Snapshots24Icon,
  Storage24Icon,
  Networking24Icon,
  Folder24Icon,
} from '@oxide/ui'
import { FormPage } from './components/FormPage'

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

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const orgCrumb = (m: RouteMatch) => m.params.orgName!
const projectCrumb = (m: RouteMatch) => m.params.projectName!
const instanceCrumb = (m: RouteMatch) => m.params.instanceName!
/* eslint-enable @typescript-eslint/no-non-null-assertion */

/** React Router route config in JSX form */
export const routes = (
  <Routes>
    <Route path="*" element={<NotFound />} />
    <Route path="spoof_login" element={<AuthLayout />}>
      <Route index element={<LoginPage />} />
    </Route>

    <Route index element={<Navigate to="/orgs" replace />} />

    <Route path="orgs">
      <Route
        element={<RootLayout />}
        icon={<Folder24Icon />}
        title="Organizations"
      >
        <Route index element={<OrgsPage />} />
        <Route
          path="new"
          title="Create Organization"
          element={<FormPage id="org-create" />}
        />
      </Route>

      <Route path=":orgName" crumb={orgCrumb} icon={<Folder24Icon />}>
        <Route index element={<Navigate to="projects" replace />} />
        <Route path="projects" crumb="Projects">
          {/* ORG */}
          <Route element={<OrgLayout />}>
            <Route index element={<ProjectsPage />} />
            <Route
              path="new"
              element={<FormPage id="project-create" />}
              crumb="Create project"
            />
          </Route>

          {/* PROJECT */}
          <Route
            path=":projectName"
            element={<ProjectLayout />}
            crumb={projectCrumb}
          >
            <Route index element={<Navigate to="instances" replace />} />
            <Route
              path="instances"
              crumb="Instances"
              icon={<Instances24Icon />}
            >
              <Route index element={<InstancesPage />} />
              <Route
                path="new"
                element={<InstanceCreatePage />}
                title="Create instance"
                icon={<Instances24Icon />}
              />
              <Route
                path=":instanceName"
                // layout has to be here instead of one up because it handles
                // the breadcrumbs, which need instanceName to be defined
                element={<InstancePage />}
                crumb={instanceCrumb}
              />
            </Route>
            <Route path="vpcs" crumb="Vpcs" icon={<Networking24Icon />}>
              <Route index element={<VpcsPage />} />
              <Route path=":vpcName" element={<VpcPage />} />
            </Route>
            <Route path="disks" crumb="Disks" icon={<Storage24Icon />}>
              <Route index element={<DisksPage />} />
              <Route
                path="new"
                element={<FormPage id="disk-create" />}
                title="Create disk"
                icon={<Storage24Icon />}
              />
            </Route>
            <Route
              path="snapshots"
              element={<SnapshotsPage />}
              crumb="Snapshots"
              icon={<Snapshots24Icon />}
            />
            <Route path="audit" crumb="Audit" />
            <Route
              path="images"
              element={<ImagesPage />}
              crumb="Images"
              icon={<Image24Icon />}
            />
            <Route
              path="access"
              element={<AccessPage />}
              crumb="Access & IAM"
              icon={<Access24Icon />}
            />
            <Route path="settings" crumb="Settings" />
          </Route>
        </Route>
      </Route>
    </Route>

    <Route path="__debug" element={<RootLayout />}>
      <Route path="toasts" element={<ToastTestPage />} />
    </Route>
  </Routes>
)

/**
 * Turn JSX route config info object config.
 *
 * Copied from React Router with one modification: use a custom RouteObject type
 * in order to be able to put `crumb` prop directly on the <Route> elements
 * https://github.com/remix-run/react-router/blob/174fb105ee/packages/react-router/index.tsx#L685
 * */
function createRoutesFromChildren(children: React.ReactNode): RouteObject[] {
  const routes: RouteObject[] = []

  React.Children.forEach(children, (element) => {
    if (!React.isValidElement(element)) {
      // Ignore non-elements. This allows people to more easily inline
      // conditionals in their route config.
      return
    }

    if (element.type === React.Fragment) {
      // Transparently support React.Fragment and its children.
      routes.push(...createRoutesFromChildren(element.props.children))
      return
    }

    // only real difference from the original: allow arbitrary props
    const route: RouteObject = { ...element.props }

    if (element.props.children) {
      route.children = createRoutesFromChildren(element.props.children)
    }

    routes.push(route)
  })

  return routes
}

/** React Router route config in object form. Used by useMatches. */
export const getRouteConfig = () => createRoutesFromChildren(routes)
