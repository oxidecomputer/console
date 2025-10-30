/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import { type LoaderFunctionArgs } from 'react-router'
import * as R from 'remeda'
import { match } from 'ts-pattern'

import { AccessToken24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import {
  apiqErrorsAllowed,
  apiQueryClient,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type ScimClientBearerToken,
  type ScimClientBearerTokenValue,
} from '~/api'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getSiloSelector, useSiloSelector } from '~/hooks/use-params'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { CardBlock } from '~/ui/lib/CardBlock'
import { CopyToClipboard } from '~/ui/lib/CopyToClipboard'
import { CreateButton } from '~/ui/lib/CreateButton'
import { DateTime } from '~/ui/lib/DateTime'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { TableEmptyBox } from '~/ui/lib/Table'
import { Truncate } from '~/ui/lib/Truncate'

export const handle = makeCrumb('SCIM')

const colHelper = createColumnHelper<ScimClientBearerToken>()
const staticColumns = [
  colHelper.accessor('id', {
    header: 'ID',
    cell: (info) => <Truncate text={info.getValue()} position="middle" maxLength={18} />,
  }),
  colHelper.accessor('timeCreated', Columns.timeCreated),
  colHelper.accessor('timeExpires', {
    header: 'Expires',
    cell: (info) => {
      const expires = info.getValue()
      return expires ? <DateTime date={expires} /> : <Badge color="neutral">Never</Badge>
    },
    meta: { thClassName: 'lg:w-1/4' },
  }),
]

const EmptyState = () => (
  <TableEmptyBox border={false}>
    <EmptyMessage
      icon={<AccessToken24Icon />}
      title="No SCIM tokens"
      body="Create a token to see it here"
    />
  </TableEmptyBox>
)

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { silo } = getSiloSelector(params)
  // Use errors-allowed approach so 403s don't throw and break the loader
  await queryClient.prefetchQuery(apiqErrorsAllowed('scimTokenList', { query: { silo } }))
  return null
}

type ModalState =
  | { kind: 'create' }
  | { kind: 'created'; token: ScimClientBearerTokenValue }
  | false

export default function SiloScimTab() {
  const siloSelector = useSiloSelector()
  const { data: tokensResult } = usePrefetchedQuery(
    apiqErrorsAllowed('scimTokenList', { query: siloSelector })
  )

  const [modalState, setModalState] = useState<ModalState>(false)

  return (
    <>
      <CardBlock>
        <CardBlock.Header
          title="SCIM Tokens"
          titleId="scim-tokens-label"
          description="Tokens for authenticating requests to SCIM endpoints"
        >
          {
            // assume that if you can see the tokens, you can create tokens
            tokensResult.type === 'success' && (
              <CreateButton onClick={() => setModalState({ kind: 'create' })}>
                Create token
              </CreateButton>
            )
          }
        </CardBlock.Header>
        <CardBlock.Body>
          {match(tokensResult)
            .with({ type: 'error' }, () => (
              <TableEmptyBox border={false}>
                <EmptyMessage
                  icon={<AccessToken24Icon />}
                  title="You do not have permission to view SCIM tokens"
                  body="Only fleet and silo admins can manage SCIM tokens for this silo"
                />
              </TableEmptyBox>
            ))
            .with({ type: 'success' }, ({ data }) => <TokensTable tokens={data} />)
            .exhaustive()}
        </CardBlock.Body>
        {/* TODO: put this back!
        <CardBlock.Footer>
          <LearnMore href={links.scimDocs} text="SCIM" />
        </CardBlock.Footer> */}
      </CardBlock>

      {match(modalState)
        .with({ kind: 'create' }, () => (
          <CreateTokenModal
            siloSelector={siloSelector}
            onDismiss={() => setModalState(false)}
            onSuccess={(token) => setModalState({ kind: 'created', token })}
          />
        ))
        .with({ kind: 'created' }, ({ token }) => (
          <TokenCreatedModal token={token} onDismiss={() => setModalState(false)} />
        ))
        .with(false, () => null)
        .exhaustive()}
    </>
  )
}

function TokensTable({ tokens }: { tokens: ScimClientBearerToken[] }) {
  const siloSelector = useSiloSelector()
  const deleteToken = useApiMutation('scimTokenDelete', {
    onSuccess() {
      queryClient.invalidateEndpoint('scimTokenList')
    },
  })

  // Order tokens by creation date, oldest first
  const sortedTokens = useMemo(() => R.sortBy(tokens, (a) => a.timeCreated), [tokens])

  const makeActions = useCallback(
    (token: ScimClientBearerToken): MenuAction[] => [
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () =>
            deleteToken.mutateAsync({ path: { tokenId: token.id }, query: siloSelector }),
          resourceKind: 'SCIM token',
          label: token.id,
        }),
      },
    ],
    [deleteToken, siloSelector]
  )

  const columns = useColsWithActions(staticColumns, makeActions, 'Copy token ID')

  const table = useReactTable({
    data: sortedTokens,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (sortedTokens.length === 0) return <EmptyState />

  return (
    <Table aria-labelledby="scim-tokens-label" table={table} className="table-inline" />
  )
}

function CreateTokenModal({
  siloSelector,
  onDismiss,
  onSuccess,
}: {
  siloSelector: { silo: string }
  onDismiss: () => void
  onSuccess: (token: ScimClientBearerTokenValue) => void
}) {
  const createToken = useApiMutation('scimTokenCreate', {
    onSuccess(token) {
      apiQueryClient.invalidateQueries('scimTokenList')
      onSuccess(token)
    },
    onError(err) {
      addToast({ variant: 'error', title: 'Failed to create token', content: err.message })
    },
  })

  return (
    <Modal isOpen onDismiss={onDismiss} title="Create SCIM token">
      <Modal.Section>
        Anyone with this token can manage users and groups in this silo via SCIM. Since
        group membership grants roles, this token can be used to give a user admin
        privileges. Store it securely and never share it publicly.
      </Modal.Section>

      <Modal.Footer
        onDismiss={onDismiss}
        onAction={() => {
          createToken.mutate({ query: { silo: siloSelector.silo } })
        }}
        actionText="Create"
        actionLoading={createToken.isPending}
      />
    </Modal>
  )
}

function TokenCreatedModal({
  token,
  onDismiss,
}: {
  token: ScimClientBearerTokenValue
  onDismiss: () => void
}) {
  return (
    <Modal isOpen onDismiss={onDismiss} title="SCIM token created" width="free">
      <Modal.Section>
        <Message
          variant="notice"
          content={
            <div className="max-w-md">
              You won’t see this token again. Copy it and store it securely.
            </div>
          }
        />

        <div className="mt-4">
          <div className="text-sans-md text-raise mb-2">Bearer Token</div>
          <div className="text-sans-md text-raise bg-default border-default flex items-stretch rounded border">
            <div className="flex-1 overflow-hidden py-2.75 pr-5 pl-3 text-nowrap text-ellipsis">
              {token.bearerToken}
            </div>
            <div className="border-default flex w-8 items-center justify-center border-l">
              <CopyToClipboard text={token.bearerToken} />
            </div>
          </div>
        </div>
      </Modal.Section>

      <Modal.Footer
        onDismiss={onDismiss}
        actionText="Done"
        onAction={onDismiss}
        showCancel={false}
      />
    </Modal>
  )
}
