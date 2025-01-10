/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Link, type LoaderFunctionArgs } from 'react-router'

import { apiQueryClient, usePrefetchedApiQuery } from '~/api'
import { EquivalentCliCommand } from '~/components/EquivalentCliCommand'
import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'
import { buttonStyle } from '~/ui/lib/Button'
import { InlineCode } from '~/ui/lib/InlineCode'
import { LearnMore, SettingsGroup } from '~/ui/lib/SettingsGroup'
import { cliCmd } from '~/util/cli-cmd'
import { links } from '~/util/links'
import { pb } from '~/util/path-builder'

export async function loader({ params }: LoaderFunctionArgs) {
  const { project, instance } = getInstanceSelector(params)
  await apiQueryClient.prefetchQuery('instanceExternalIpList', {
    path: { instance },
    query: { project },
  })
  return null
}

Component.displayName = 'ConnectTab'
export function Component() {
  const { project, instance } = useInstanceSelector()
  const { data: externalIps } = usePrefetchedApiQuery('instanceExternalIpList', {
    path: { instance },
    query: { project },
  })
  const floatingIp = externalIps.items.find((ip) => ip.kind === 'floating')
  const ephemeralIp = externalIps.items.find((ip) => ip.kind === 'ephemeral')
  // prefer floating, fall back to ephemeral
  const externalIp = floatingIp?.ip || ephemeralIp?.ip

  return (
    <div className="space-y-6">
      <SettingsGroup.Container>
        <SettingsGroup.Body>
          <SettingsGroup.Title>Serial console</SettingsGroup.Title>
          Connect to your instance&rsquo;s serial console
        </SettingsGroup.Body>
        <SettingsGroup.Footer>
          <div>
            <LearnMore text="Serial Console" href={links.serialConsoleDocs} />
          </div>
          <div className="flex gap-3">
            <EquivalentCliCommand command={cliCmd.serialConsole({ project, instance })} />
            <Link
              to={pb.serialConsole({ project, instance })}
              className={buttonStyle({ size: 'sm' })}
            >
              Connect
            </Link>
          </div>
        </SettingsGroup.Footer>
      </SettingsGroup.Container>
      <SettingsGroup.Container>
        <SettingsGroup.Body>
          <SettingsGroup.Title>SSH</SettingsGroup.Title>
          <p>
            If your instance allows SSH access, connect with{' '}
            <InlineCode>ssh [username]@{externalIp || '[external IP]'}</InlineCode>.
          </p>
          {!externalIp && (
            <p className="mt-2">
              This instance has no external IP address. You can add one on the{' '}
              <Link
                className="link-with-underline"
                to={pb.instanceNetworking({ project, instance })}
              >
                networking
              </Link>{' '}
              tab.
            </p>
          )}
        </SettingsGroup.Body>
        <SettingsGroup.Footer>
          <div>
            <LearnMore text="SSH" href={links.sshDocs} />
          </div>
        </SettingsGroup.Footer>
      </SettingsGroup.Container>
    </div>
  )
}
