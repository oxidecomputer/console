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
import { pb } from '~/util/path-builder'

// This loader runs once on entry; react-router won't re-run it when navigating
// between sibling tab routes.
export async function clientLoader() {
  await prefetchUsersAndGroups()
  return null
}

export const handle = makeCrumb('Silo Access', pb.siloUsers())

export default function SiloUsersGroupsPage() {
  return (
    <UsersGroupsLayout
      title="Silo Access"
      usersPath={pb.siloUsers()}
      groupsPath={pb.siloGroups()}
      summary="Users and groups come from the silo's identity provider. Assign silo and project roles to control what they can view, edit, or administer."
    />
  )
}
