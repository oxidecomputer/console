/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Badge } from 'libs/ui/lib/badge/Badge'
import { Button } from 'libs/ui/lib/button/Button'
import { EmptyMessage } from 'libs/ui/lib/empty-message/EmptyMessage'
import { useMemo, useState } from 'react'

import { useApiMutation, useApiQuery, useApiQueryClient, type SiloIpPool } from '@oxide/api'
import { linkCell, useQueryTable, type MenuAction } from '@oxide/table'
import { Message, Modal, Networking24Icon, Success12Icon } from '@oxide/ui'

import { ExternalLink } from 'app/components/ExternalLink'
import { ListboxField } from 'app/components/form'
import { HL } from 'app/components/HL'
import { useForm, useSiloSelector } from 'app/hooks'
import { confirmAction } from 'app/stores/confirm-action'
import { addToast } from 'app/stores/toast'
import { links } from 'app/util/links'
import { pb } from 'app/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No IP pools"
    body="You need to create an IP pool to be able to see it here"
    buttonText="New IP pool"
    buttonTo={pb.ipPoolNew()}
  />
)

export function SiloIpPoolsTab() {
  const { silo } = useSiloSelector()
  const [showLinkModal, setShowLinkModal] = useState(false)
  const { Table, Column } = useQueryTable('siloIpPoolList', { path: { silo } })
  const queryClient = useApiQueryClient()

  // Fetch 1000 to we can be sure to get them all. There should only be a few
  // anyway. Not prefetched because the prefetched one only gets 25 to match the
  // query table. This req is better to do async because they can't click make
  // default that fast anyway.
  const { data: allPools } = useApiQuery('siloIpPoolList', {
    path: { silo },
    query: { limit: 1000 },
  })

  // used in change default confirm modal
  const defaultPool = useMemo(
    () => (allPools ? allPools.items.find((p) => p.isDefault)?.name : undefined),
    [allPools]
  )

  const updatePoolLink = useApiMutation('ipPoolSiloUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('siloIpPoolList')
    },
  })
  const unlinkPool = useApiMutation('ipPoolSiloUnlink', {
    onSuccess() {
      queryClient.invalidateQueries('siloIpPoolList')
    },
  })

  // this is all very extra. I'm sorry. it's for the users
  const makeActions = (pool: SiloIpPool): MenuAction[] => [
    {
      label: pool.isDefault ? 'Clear default' : 'Make default',
      className: pool.isDefault ? 'destructive' : undefined,
      onActivate() {
        if (pool.isDefault) {
          confirmAction({
            doAction: () =>
              updatePoolLink.mutateAsync({
                path: { silo, pool: pool.id },
                body: { isDefault: false },
              }),
            modalTitle: 'Confirm clear default',
            modalContent: (
              <p>
                Are you sure you want <HL>{pool.name}</HL> to stop being the default pool
                for this silo? If there is no default, users in this silo will have to
                specify a pool when allocating IPs.
              </p>
            ),
            errorTitle: 'Could not clear default',
            actionType: 'danger',
          })
        } else {
          const modalContent = defaultPool ? (
            <p>
              Are you sure you want to change the default pool from <HL>{defaultPool}</HL>{' '}
              to <HL>{pool.name}</HL>?
            </p>
          ) : (
            <p>
              Are you sure you want to make <HL>{pool.name}</HL> the default pool for this
              silo?
            </p>
          )
          const verb = defaultPool ? 'change' : 'make'
          confirmAction({
            doAction: () =>
              updatePoolLink.mutateAsync({
                path: { silo, pool: pool.id },
                body: { isDefault: true },
              }),
            modalTitle: `Confirm ${verb} default`,
            modalContent,
            errorTitle: `Could not ${verb} default`,
            actionType: 'primary',
          })
        }
      },
    },
    {
      label: 'Unlink',
      className: 'destructive',
      onActivate() {
        confirmAction({
          doAction: () => unlinkPool.mutateAsync({ path: { silo, pool: pool.id } }),
          modalTitle: `Confirm unlink pool`,
          modalContent: (
            <p>
              Are you sure you want to unlink <HL>{pool.name}</HL>? Users in this silo will
              no longer be able to allocate IPs from this pool. Unlink will fail if there
              are any IPs from <HL>{pool.name}</HL> in use in this silo.
            </p>
          ),
          errorTitle: `Could not unlink pool`,
          actionType: 'danger',
        })
      },
    },
  ]

  return (
    <>
      <div className="mb-8 flex items-end justify-between space-x-2">
        <p className="mr-8 max-w-2xl text-sans-md text-secondary">
          Users in this silo can allocate external IPs from these pools for their instances.
          A silo can have at most one default pool. IPs are allocated from the default pool
          when users ask for one without specifying a pool. Read the docs to learn more
          about <ExternalLink href={links.ipPoolsDocs}>managing IP pools</ExternalLink>.
        </p>
        <Button onClick={() => setShowLinkModal(true)} size="sm" className="shrink-0">
          Link pool
        </Button>
      </div>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" cell={linkCell((pool) => pb.ipPool({ pool }))} />
        <Column accessor="description" />
        <Column
          accessor="isDefault"
          header="Default"
          cell={({ value }) =>
            value && (
              <>
                <Success12Icon className="mr-1 text-accent" />
                <Badge>default</Badge>
              </>
            )
          }
        />
      </Table>
      {showLinkModal && <LinkPoolModal onDismiss={() => setShowLinkModal(false)} />}
    </>
  )
}

type LinkPoolFormValues = {
  pool: string | undefined
}

const defaultValues: LinkPoolFormValues = { pool: undefined }

function LinkPoolModal({ onDismiss }: { onDismiss: () => void }) {
  const queryClient = useApiQueryClient()
  const { silo } = useSiloSelector()
  const { control, handleSubmit } = useForm({ defaultValues })

  const linkPool = useApiMutation('ipPoolSiloLink', {
    onSuccess() {
      queryClient.invalidateQueries('siloIpPoolList')
    },
    onError(err) {
      addToast({ title: 'Could not link pool', content: err.message, variant: 'error' })
    },
    onSettled: onDismiss,
  })

  function onSubmit({ pool }: LinkPoolFormValues) {
    if (!pool) return // can't happen, silo is required
    linkPool.mutate({ path: { pool }, body: { silo, isDefault: false } })
  }

  const linkedPools = useApiQuery('siloIpPoolList', {
    path: { silo },
    query: { limit: 1000 },
  })
  const allPools = useApiQuery('ipPoolList', { query: { limit: 1000 } })

  // in order to get the list of remaining unlinked pools, we have to get the
  // list of all pools and remove the already linked ones

  const linkedPoolIds = useMemo(
    () => (linkedPools.data ? new Set(linkedPools.data.items.map((p) => p.id)) : undefined),
    [linkedPools]
  )
  const unlinkedPoolItems = useMemo(
    () =>
      allPools.data && linkedPoolIds
        ? allPools.data.items
            .filter((p) => !linkedPoolIds.has(p.id))
            .map((p) => ({ value: p.name, label: p.name }))
        : [],
    [allPools, linkedPoolIds]
  )

  return (
    <Modal isOpen onDismiss={onDismiss} title="Link pool">
      <Modal.Body>
        <Modal.Section>
          <form
            autoComplete="off"
            onSubmit={(e) => {
              e.stopPropagation()
              handleSubmit(onSubmit)(e)
            }}
            className="space-y-4"
          >
            <Message
              variant="info"
              content="Users in this silo will be able to allocate IPs from the selected pool."
            />

            <ListboxField
              placeholder="Select pool"
              name="pool"
              label="IP pool"
              items={unlinkedPoolItems}
              isLoading={linkedPools.isPending || allPools.isPending}
              required
              control={control}
            />
          </form>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        onDismiss={onDismiss}
        onAction={handleSubmit(onSubmit)}
        actionText="Link"
        actionLoading={linkPool.isPending}
      />
    </Modal>
  )
}
