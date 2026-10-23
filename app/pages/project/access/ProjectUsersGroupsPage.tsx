/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { prefetchUsersAndGroups } from '~/components/access/policy-scope'
import { UsersGroupsLayout } from '~/components/access/UsersGroupsLayout'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'

import type { Route } from './+types/ProjectUsersGroupsPage'

// This loader runs once on entry; react-router won't re-run it when navigating
// between sibling tab routes.
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { project } = params
  await prefetchUsersAndGroups(project)
  return null
}

export const handle = makeCrumb('Project Access', (p) =>
  pb.projectUsers(getProjectSelector(p))
)

export default function ProjectUsersGroupsPage() {
  const projectSelector = useProjectSelector()
  return (
    <UsersGroupsLayout
      title="Project Access"
      usersPath={pb.projectUsers(projectSelector)}
      groupsPath={pb.projectGroups(projectSelector)}
      summary="Users and groups come from the silo's identity provider. Project roles determine who can view, edit, or administer this project. Silo roles apply to every project in the silo, and a user's effective role is the strongest of their own roles and those of their groups."
    />
  )
}
