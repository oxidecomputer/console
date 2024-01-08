/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { SettingsGroup } from '@oxide/ui'

import { useInstanceSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

export function ConnectTab() {
  const { project, instance } = useInstanceSelector()

  return (
    <SettingsGroup
      title="Serial Console"
      cta={pb.serialConsole({ project, instance })}
      ctaText="Connect"
    >
      Connect to your instance&rsquo;s serial console
    </SettingsGroup>
  )
}
