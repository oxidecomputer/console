/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { index, layout, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  layout('./layouts/RootLayout.tsx', [
    layout('./layouts/AuthenticatedLayout.tsx', [
      layout('./layouts/SiloLayout.tsx', [
        layout('./pages/ProjectsPage.tsx', [
          route('projects', './pages/NullPage.tsx'),
          route('projects-new', './forms/project-create.tsx'),
          route('projects/:project/edit', './forms/project-edit.tsx'),
        ]),
        route('images', './pages/SiloImagesPage.tsx', [
          route(':image/edit', './pages/SiloImageEdit.tsx'),
        ]),
        route('utilization', './pages/SiloUtilizationPage.tsx'),
        route('access', './pages/SiloAccessPage.tsx'),
        route('lookup/instances/:instance', './pages/InstanceLookup.tsx'),
        route('lookup/i/:instance', './pages/InstanceLookup.tsx', {
          id: 'instance-lookup-shorthand', // needed to dedupe route ID
        }),
      ]),
      route('projects', './pages/ProjectsCrumb.tsx', [
        route(':project', './layouts/ProjectLayout.tsx', [
          route('instances', './pages/project/InstancesCrumb.tsx', [
            index('./pages/project/instances/InstancesPage.tsx'),
            route(':instance', './pages/project/instances/InstancePage.tsx', [
              // TODO: index route with nav redirect
              route('storage', './pages/project/instances/StorageTab.tsx'),
              route('networking', './pages/project/instances/NetworkingTab.tsx'),
              route('metrics', './pages/project/instances/MetricsTab.tsx', [
                route('cpu', './pages/project/instances/CpuMetricsTab.tsx'),
                route('disk', './pages/project/instances/DiskMetricsTab.tsx'),
                route('network', './pages/project/instances/NetworkMetricsTab.tsx'),
              ]),
              route('connect', './pages/project/instances/ConnectTab.tsx'),
              route('settings', './pages/project/instances/SettingsTab.tsx'),
            ]),
          ]),
        ]),
      ]),
    ]),
  ]),
] satisfies RouteConfig
