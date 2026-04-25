/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { MAX_DISKS_PER_INSTANCE } from '@oxide/api'

import { db, lookup } from './db'

function applyDiskAttachLimitScenario() {
  const instance = lookup.instance({ project: 'mock-project', instance: 'db1' })
  instance.run_state = 'stopped'

  const alreadyAttached = db.disks.filter(
    (disk) => 'instance' in disk.state && disk.state.instance === instance.id
  )
  const diskNamesToAttach = [
    'disk-3',
    'disk-4',
    'disk-5',
    'disk-6',
    'disk-7',
    'disk-8',
    'disk-9',
    'disk-10',
    'local-disk',
    'read-only-disk',
  ]

  if (alreadyAttached.length + diskNamesToAttach.length !== MAX_DISKS_PER_INSTANCE) {
    throw new Error('Disk attach limit scenario no longer matches the API disk limit')
  }

  for (const diskName of diskNamesToAttach) {
    const disk = lookup.disk({ project: 'mock-project', disk: diskName })
    disk.state = { state: 'attached', instance: instance.id }
  }
}

export function applyMockApiScenario(scenario: string | undefined) {
  if (!scenario) return

  switch (scenario) {
    case 'bombadil-disk-attach-limit':
      applyDiskAttachLimitScenario()
      return
    default:
      throw new Error(`Unknown mock API scenario '${scenario}'`)
  }
}
