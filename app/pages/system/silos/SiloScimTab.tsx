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

import { AccessToken24Icon, OpenLink12Icon } from '@oxide/design-system/icons/react'

import {
  apiQueryClient,
  useApiMutation,
  usePrefetchedApiQuery,
  type ScimClientBearerToken,
} from '~/api'
import { getSiloSelector, useSiloSelector } from '~/hooks/use-params'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { Badge } from '~/ui/lib/Badge'
import { Button } from '~/ui/lib/Button'
import { CardBlock } from '~/ui/lib/CardBlock'
import { CopyToClipboard } from '~/ui/lib/CopyToClipboard'
import { CreateButton } from '~/ui/lib/CreateButton'
import { DateTime } from '~/ui/lib/DateTime'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { TableEmptyBox } from '~/ui/lib/Table'
import { Tooltip } from '~/ui/lib/Tooltip'
import { docLinks } from '~/util/links'

const colHelper = createColumnHelper<ScimClientBearerToken>()

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
  await apiQueryClient.prefetchQuery('scimTokenList', { query: { silo } })
  return null
}

export default function SiloScimTab() {
  const siloSelector = useSiloSelector()
  const { data: tokens } = usePrefetchedApiQuery('scimTokenList', {
    query: { silo: siloSelector.silo },
  })

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createdToken, setCreatedToken] = useState<{
    id: string
    bearerToken: string
    timeCreated: Date
    timeExpires?: Date | null
  } | null>(null)

  const deleteToken = useApiMutation('scimTokenDelete', {
    onSuccess() {
      apiQueryClient.invalidateQueries('scimTokenList')
    },
  })

  const deleteAllTokens = useApiMutation('scimTokenDeleteAll', {
    onSuccess() {
      apiQueryClient.invalidateQueries('scimTokenList')
    },
  })

  const makeActions = useCallback(
    (token: ScimClientBearerToken): MenuAction[] => [
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () =>
            deleteToken.mutateAsync({
              path: { tokenId: token.id },
              query: { silo: siloSelector.silo },
            }),
          label: token.id,
        }),
      },
    ],
    [deleteToken, siloSelector.silo]
  )

  const staticColumns = useMemo(
    () => [
      colHelper.accessor('id', {
        header: 'ID',
        cell: (info) => {
          const id = info.getValue()
          return (
            <Tooltip content={id}>
              <span className="font-mono text-secondary">
                {id.slice(0, 8)}...{id.slice(-6)}
              </span>
            </Tooltip>
          )
        },
      }),
      colHelper.accessor('timeCreated', Columns.timeCreated),
      colHelper.accessor('timeExpires', {
        header: 'Expires',
        cell: (info) => {
          const expires = info.getValue()
          return expires ? (
            <DateTime date={expires} />
          ) : (
            <Badge color="neutral">Never</Badge>
          )
        },
      }),
    ],
    []
  )

  const columns = useColsWithActions(staticColumns, makeActions, 'Copy token ID')

  const table = useReactTable({
    data: tokens,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  const { href, linkText } = docLinks.scim
  return (
    <>
      <CardBlock>
        <CardBlock.Header
          title="SCIM Bearer Tokens"
          titleId="scim-tokens-label"
          description="Manage authentication tokens for SCIM identity provisioning"
        >
          {tokens.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={confirmDelete({
                doDelete: () =>
                  deleteAllTokens.mutateAsync({
                    query: { silo: siloSelector.silo },
                  }),
                label: 'all SCIM tokens',
              })}
            >
              Delete all
            </Button>
          )}
          <CreateButton onClick={() => setShowCreateModal(true)}>Create token</CreateButton>
        </CardBlock.Header>
        <CardBlock.Body>
          {tokens.length === 0 ? (
            <EmptyState />
          ) : (
            <Table
              aria-labelledby="scim-tokens-label"
              table={table}
              className="table-inline"
            />
          )}
        </CardBlock.Body>
        <CardBlock.Footer>
          <div className="relative -ml-2 inline-block rounded py-1 pl-2 pr-7 text-sans-md text-raise group-hover:bg-tertiary">
            <span className="inline-block max-w-[300px] truncate align-middle">
              Learn more about{' '}
              <a
                href={href}
                className="text-accent group-hover:text-accent"
                target="_blank"
                rel="noopener noreferrer"
              >
                {linkText}
                <OpenLink12Icon className="absolute top-1.5 ml-1 translate-y-[1px]" />
              </a>
            </span>
          </div>
        </CardBlock.Footer>
      </CardBlock>

      {showCreateModal && (
        <CreateTokenModal
          siloSelector={siloSelector}
          onDismiss={() => setShowCreateModal(false)}
          onSuccess={(token) => {
            setShowCreateModal(false)
            setCreatedToken(token)
          }}
        />
      )}

      {createdToken && (
        <TokenCreatedModal token={createdToken} onDismiss={() => setCreatedToken(null)} />
      )}
    </>
  )
}

function CreateTokenModal({
  siloSelector,
  onDismiss,
  onSuccess,
}: {
  siloSelector: { silo: string }
  onDismiss: () => void
  onSuccess: (token: {
    id: string
    bearerToken: string
    timeCreated: Date
    timeExpires?: Date | null
  }) => void
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
    <Modal isOpen onDismiss={onDismiss} title="Create token">
      <Modal.Section>
        <Message
          variant="info"
          content="This token will have access to provision users and groups via SCIM. Store it securely and never share it publicly."
        />
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
  token: {
    id: string
    bearerToken: string
    timeCreated: Date
    timeExpires?: Date | null
  }
  onDismiss: () => void
}) {
  return (
    <Modal isOpen onDismiss={onDismiss} title="Create token">
      <Modal.Section>
        {token.timeExpires && (
          <div>
            <div className="mb-1 text-sans-sm text-secondary">Expires</div>
            <DateTime date={token.timeExpires} />
          </div>
        )}

        <Message
          variant="notice"
          content="This is the only time you'll see this token. Copy it now and store it securely."
        />

        <div className="mt-4">
          <div className="mb-2 font-medium text-sans-semi-md">Bearer Token</div>
          <div className="font-mono flex items-center rounded border text-sans-sm text-raise bg-default border-default">
            <div className="flex-1 overflow-hidden text-ellipsis p-3">
              {token.bearerToken}
            </div>
            <div className="border-l p-3 border-default">
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
