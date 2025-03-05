/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Link, type LoaderFunctionArgs } from 'react-router'

import { apiQueryClient, usePrefetchedApiQuery } from '~/api'
import { EquivalentCliCommand } from '~/components/CopyCode'
import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'
import { buttonStyle } from '~/ui/lib/Button'
import { CardBlock, LearnMore } from '~/ui/lib/CardBlock'
import { InlineCode } from '~/ui/lib/InlineCode'
import { links } from '~/util/links'
import { pb } from '~/util/path-builder'

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project, instance } = getInstanceSelector(params)
  await apiQueryClient.prefetchQuery('instanceExternalIpList', {
    path: { instance },
    query: { project },
  })
  return null
}

export const handle = { crumb: 'Connect' }

export default function ConnectTab() {
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
    <div className="space-y-5">
      <CardBlock width="medium">
        <CardBlock.Header
          title="Serial console"
          description="Connect to your instance’s serial console"
        >
          <EquivalentCliCommand project={project} instance={instance} />
          <Link
            to={pb.serialConsole({ project, instance })}
            className={buttonStyle({ size: 'sm' })}
          >
            Connect
          </Link>
        </CardBlock.Header>
        <CardBlock.Footer>
          <LearnMore href={links.serialConsoleDocs} text="Serial Console" />
        </CardBlock.Footer>
      </CardBlock>

      <CardBlock width="medium">
        <CardBlock.Header
          title="SSH"
          description={
            <>
              <div>
                If your instance allows SSH access, connect with{' '}
                <InlineCode>ssh [username]@{externalIp || '[external IP]'}</InlineCode>.
              </div>
              {!externalIp && (
                <div className="mt-2">
                  This instance has no external IP address. You can add one on the{' '}
                  <Link
                    className="link-with-underline"
                    to={pb.instanceNetworking({ project, instance })}
                  >
                    networking
                  </Link>{' '}
                  tab.
                </div>
              )}
            </>
          }
        />
        <CardBlock.Footer>
          <LearnMore href={links.sshDocs} text="SSH" />
        </CardBlock.Footer>
      </CardBlock>
    </div>
  )
}
