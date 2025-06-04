/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'

import { getListQFn, queryClient, useApiMutation, type DeviceAccessToken } from '@oxide/api'
import { AccessToken16Icon, AccessToken24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import { makeCrumb } from '~/hooks/use-crumbs'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { getActionsCol, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { DateTime } from '~/ui/lib/DateTime'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TipIcon } from '~/ui/lib/TipIcon'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const tokenList = () => getListQFn('currentUserAccessTokenList', {})
export const handle = makeCrumb('Access Tokens', pb.accessTokens)

export async function clientLoader() {
  await queryClient.prefetchQuery(tokenList().optionsFn())
  return null
}

const colHelper = createColumnHelper<DeviceAccessToken>()

export default function AccessTokensPage() {
  const { mutateAsync: deleteToken } = useApiMutation('currentUserAccessTokenDelete', {
    onSuccess: (_data, variables) => {
      queryClient.invalidateEndpoint('currentUserAccessTokenList')
      addToast(<>Access token <HL>{variables.path.tokenId}</HL> deleted</>) // prettier-ignore
    },
  })

  const makeActions = useCallback(
    (token: DeviceAccessToken): MenuAction[] => [
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () => deleteToken({ path: { tokenId: token.id } }),
          label: token.id,
          extraContent:
            'This cannot be undone. Any application or instance of the Oxide CLI that depends on this token will need a new one.',
        }),
      },
    ],
    [deleteToken]
  )

  const columns = useMemo(() => {
    return [
      colHelper.accessor('id', {
        header: () => (
          <>
            ID
            <TipIcon className="ml-1.5">
              A database ID for the token record, not the bearer token itself.
            </TipIcon>
          </>
        ),
        cell: (info) => <span className="font-mono">{info.getValue()}</span>,
      }),
      colHelper.accessor('timeCreated', Columns.timeCreated),
      colHelper.accessor('timeExpires', {
        header: 'Expires',
        cell: (info) => {
          const date = info.getValue()
          if (!date) return 'Never'
          return <DateTime date={date} />
        },
      }),
      getActionsCol(makeActions),
    ]
  }, [makeActions])

  const emptyState = (
    <EmptyMessage
      icon={<AccessToken16Icon />}
      title="No access tokens"
      body="Your access tokens will appear here when they are created"
    />
  )
  const { table } = useQueryTable({ query: tokenList(), columns, emptyState })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<AccessToken24Icon />}>Access Tokens</PageTitle>
        <DocsPopover
          heading="access tokens"
          icon={<AccessToken16Icon />}
          summary="Access tokens are used to authenticate API calls from the CLI and SDKs. You can list and delete tokens here. Use the CLI to generate new ones."
          links={[docLinks.deviceTokens]}
        />
      </PageHeader>
      {table}
    </>
  )
}
