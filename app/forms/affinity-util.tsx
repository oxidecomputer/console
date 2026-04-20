/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { api, q } from '~/api'
import { ALL_ISH } from '~/util/consts'
import type * as PP from '~/util/path-params'

export const instanceList = ({ project }: PP.Project) =>
  q(api.instanceList, { query: { project, limit: ALL_ISH } })

export const antiAffinityGroupList = ({ project }: PP.Project) =>
  q(api.antiAffinityGroupList, { query: { project, limit: ALL_ISH } })

export const antiAffinityGroupView = ({
  project,
  antiAffinityGroup,
}: PP.AntiAffinityGroup) =>
  q(api.antiAffinityGroupView, {
    path: { antiAffinityGroup },
    query: { project },
  })

export const antiAffinityGroupMemberList = ({
  antiAffinityGroup,
  project,
}: PP.AntiAffinityGroup) =>
  q(api.antiAffinityGroupMemberList, {
    path: { antiAffinityGroup },
    // member limit in DB is currently 32, so pagination isn't needed
    query: { project, limit: ALL_ISH },
  })

export const policyHelpText =
  "Determines whether member instances are allowed to start when the anti-affinity rule can't be satisfied"
