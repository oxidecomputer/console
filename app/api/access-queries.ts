/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { api, q } from '@oxide/api'

import type * as PP from '~/util/path-params'

export const accessQueries = {
  siloPolicy: () => q(api.policyView, {}),
  projectPolicy: ({ project }: PP.Project) =>
    q(api.projectPolicyView, { path: { project } }),
  userList: () => q(api.userList, {}),
  groupList: () => q(api.groupList, {}),
}
