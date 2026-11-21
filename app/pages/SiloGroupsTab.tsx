/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { AccessGroupsTab } from '~/components/access/AccessGroupsTab'
import { useSiloPolicyScope } from '~/components/access/policy-scope'
import { titleCrumb } from '~/hooks/use-crumbs'

export const handle = titleCrumb('Groups')

export default function SiloGroupsTab() {
  return <AccessGroupsTab scope={useSiloPolicyScope()} />
}
