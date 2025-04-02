/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { apiq } from '~/api'
import { ALL_ISH } from '~/util/consts'
import type * as PP from '~/util/path-params'

export const antiAffinityGroupMemberList = ({
  antiAffinityGroup,
  project,
}: PP.AntiAffinityGroup) =>
  apiq('antiAffinityGroupMemberList', {
    path: { antiAffinityGroup },
    // member limit in DB is currently 32, so pagination isn't needed
    query: { project, limit: ALL_ISH },
  })

export const instanceList = ({ project }: PP.Project) =>
  apiq('instanceList', { query: { project, limit: ALL_ISH } })

export const affinityGroupList = ({ project }: PP.Project) =>
  apiq('affinityGroupList', { query: { project, limit: ALL_ISH } })

export const antiAffinityGroupList = ({ project }: PP.Project) =>
  apiq('antiAffinityGroupList', { query: { project, limit: ALL_ISH } })

export const antiAffinityGroupView = ({
  project,
  antiAffinityGroup,
}: PP.AntiAffinityGroup) =>
  apiq('antiAffinityGroupView', { path: { antiAffinityGroup }, query: { project } })
