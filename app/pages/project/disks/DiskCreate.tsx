/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate } from 'react-router'

import { CreateDiskSideModalForm } from '~/forms/disk-create'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useProjectSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'

export const handle = titleCrumb('New disk')

export default function DiskCreate() {
  const navigate = useNavigate()
  const { project } = useProjectSelector()
  const onDismiss = () => navigate(pb.disks({ project }))
  return <CreateDiskSideModalForm onDismiss={onDismiss} />
}
