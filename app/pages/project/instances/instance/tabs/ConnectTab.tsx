/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { ReactNode } from 'react'
import { Link, type LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, useApiQuery } from '~/api'
import { EquivalentCliCommand } from '~/components/EquivalentCliCommand'
import { getInstanceSelector, useInstanceSelector, useProjectSelector } from '~/hooks'
import { buttonStyle } from '~/ui/lib/Button'
import { CopyToClipboard } from '~/ui/lib/CopyToClipboard'
import { SettingsGroup } from '~/ui/lib/SettingsGroup'
import { cliCmd } from '~/util/cli-cmd'
import { pb } from '~/util/path-builder'

ConnectTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, instance } = getInstanceSelector(params)
  await apiQueryClient.prefetchQuery('instanceExternalIpList', {
    path: { instance },
    query: { project },
  })
  return null
}

const InlineCode = ({ children }: { children: ReactNode }) => (
  <code className="inline-flex h-4 items-center whitespace-nowrap rounded-sm px-[3px] py-[1px] !lowercase text-mono-sm text-secondary bg-secondary">
    {children}
  </code>
)

export function ConnectTab() {
  const { project, instance } = useInstanceSelector()
  const { data: externalIps } = useApiQuery('instanceExternalIpList', {
    path: { instance },
    query: { project },
  })
  const newFloatingIpLink = pb.floatingIpsNew(useProjectSelector())
  const floatingIps = externalIps?.items?.filter((ip) => ip.kind === 'floating')
  // default to a floating IP; fall back to ephemeral IP, if it exists
  const externalIp = (floatingIps?.[0] || externalIps?.items?.[0])?.ip
  const sshCommand = `ssh [username]@${externalIp}`
  const sshCopy = externalIp ? (
    <div className="space-y-2">
      <p>
        If you specified SSH keys when you created this instance, you can connect to it
        through an external IP:{' '}
        <InlineCode>
          {sshCommand}
          <CopyToClipboard text={sshCommand} />
        </InlineCode>
      </p>
      <p>
        The <InlineCode>[username]</InlineCode> in the SSH command will depend on your
        instance’s boot disk’s OS, but might be <InlineCode>debian</InlineCode>,{' '}
        <InlineCode>ubuntu</InlineCode>, <InlineCode>arch</InlineCode>, etc.
      </p>
    </div>
  ) : (
    <p>
      If you specified SSH keys when you created this instance, you can create an external
      IP via the{' '}
      <Link to={newFloatingIpLink} className="link-with-underline">
        Floating IPs page
      </Link>{' '}
      to connect to your instance via SSH.
    </p>
  )

  return (
    <div className="space-y-6">
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
      <SettingsGroup.Container>
        <SettingsGroup.Body>
          <SettingsGroup.Title>SSH</SettingsGroup.Title>
          {sshCopy}
        </SettingsGroup.Body>
      </SettingsGroup.Container>
    </div>
  )
}
