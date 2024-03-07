/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useState } from 'react'

import { EquivalentCliCommandModal } from '~/components/EquivalentCliCommand'
import { useInstanceSelector } from '~/hooks'
import { SettingsGroup } from '~/ui/lib/SettingsGroup'
import { pb } from '~/util/path-builder'

import { serialConsoleCliCommand } from '../SerialConsolePage'

export function ConnectTab() {
  const { project, instance } = useInstanceSelector()

  const [cliModalOpen, setCliModalOpen] = useState(false)

  return (
    <>
      <EquivalentCliCommandModal
        isOpen={cliModalOpen}
        handleDismiss={() => setCliModalOpen(false)}
        command={serialConsoleCliCommand(project, instance)}
      />
      <SettingsGroup
        title="Serial Console"
        cta={pb.serialConsole({ project, instance })}
        ctaText="Connect"
        secondaryCta={() => setCliModalOpen(true)}
        secondaryCtaText="Equivalent CLI Command"
      >
        Connect to your instance&rsquo;s serial console
      </SettingsGroup>
    </>
  )
}
