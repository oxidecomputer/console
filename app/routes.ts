/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { layout, route, type RouteConfig } from '@react-router/dev/routes'

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
    ]),
  ]),
] satisfies RouteConfig
