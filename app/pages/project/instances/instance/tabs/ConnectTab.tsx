/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Link } from 'react-router-dom'

import { EquivalentCliCommand } from '~/components/EquivalentCliCommand'
import { useInstanceSelector } from '~/hooks'
import { buttonStyle } from '~/ui/lib/Button'
import { SettingsGroup } from '~/ui/lib/SettingsGroup'
import { cliCmd } from '~/util/cli-cmd'
import { pb } from '~/util/path-builder'

export function ConnectTab() {
  const { project, instance } = useInstanceSelector()

  return (
    <SettingsGroup.Container>
      <SettingsGroup.Body>
        <SettingsGroup.Title>Serial console</SettingsGroup.Title>
        Connect to your instance&rsquo;s serial console
      </SettingsGroup.Body>
      <SettingsGroup.Footer>
        <EquivalentCliCommand command={cliCmd.serialConsole({ project, instance })} />
        <Link
          to={pb.serialConsole({ project, instance })}
          className={buttonStyle({ size: 'sm' })}
        >
          Connect
        </Link>
      </SettingsGroup.Footer>
    </SettingsGroup.Container>
  )
}
