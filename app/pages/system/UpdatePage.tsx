/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as R from 'remeda'

import {
  Images24Icon,
  SoftwareUpdate16Icon,
  SoftwareUpdate24Icon,
  Time16Icon,
} from '@oxide/design-system/icons/react'

import {
  apiq,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type UpdateStatus,
} from '~/api'
import { DocsPopover } from '~/components/DocsPopover'
import { FileField } from '~/components/form/fields/FileField'
import { HL } from '~/components/HL'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { RefreshButton } from '~/components/RefreshButton'
import { makeCrumb } from '~/hooks/use-crumbs'
import { confirmAction } from '~/stores/confirm-action'
import { addToast } from '~/stores/toast'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { Badge } from '~/ui/lib/Badge'
import { Button } from '~/ui/lib/Button'
import { CardBlock } from '~/ui/lib/CardBlock'
import { DateTime } from '~/ui/lib/DateTime'
import * as DropdownMenu from '~/ui/lib/DropdownMenu'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { TipIcon } from '~/ui/lib/TipIcon'
import { docLinks } from '~/util/links'
import { percentage, round } from '~/util/math'

export const handle = makeCrumb('System Update')

const refreshData = () =>
  Promise.all([
    queryClient.invalidateEndpoint('systemUpdateStatus'),
    queryClient.invalidateEndpoint('systemUpdateRepositoryList'),
  ])

export async function clientLoader() {
  await Promise.all([
    queryClient.prefetchQuery(apiq('systemUpdateStatus', {})),
    queryClient.prefetchQuery(apiq('systemUpdateRepositoryList', {})),
  ])
  return null
}

function calcProgress(status: UpdateStatus) {
  const targetVersion = status.targetRelease?.version
  if (!targetVersion) return null

  const total = R.sum(Object.values(status.componentsByReleaseVersion))
  const current = status.componentsByReleaseVersion[targetVersion] || 0

  return {
    current,
    total,
    // trunc prevents, e.g., 999/1000 being reported as 100%
    percentage: round(percentage(current, total), 0, 'trunc'),
  }
}

export default function UpdatePage() {
  const { data: status } = usePrefetchedQuery(apiq('systemUpdateStatus', {}))
  const { data: repos } = usePrefetchedQuery(apiq('systemUpdateRepositoryList', {}))
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const closeUploadModal = () => setUploadModalOpen(false)

  const { mutateAsync: setTargetRelease } = useApiMutation('targetReleaseUpdate', {
    onSuccess() {
      queryClient.invalidateEndpoint('systemUpdateStatus')
      addToast({ content: 'Target release updated' })
    },
    onError(err) {
      addToast({
        title: 'Could not update target release',
        content: err.message,
        variant: 'error',
      })
    },
  })

  const componentProgress = useMemo(() => calcProgress(status), [status])

  return (
    <>
      <PageHeader>
        <PageTitle icon={<SoftwareUpdate24Icon />}>System Update</PageTitle>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={refreshData} />
          <DocsPopover
            heading="system update"
            icon={<SoftwareUpdate16Icon />}
            summary="The update system automatically updates components to the target release."
            links={[docLinks.systemUpdate]}
          />
        </div>
      </PageHeader>
      <PropertiesTable className="-mt-8 mb-8">
        <PropertiesTable.Row label="Target release">
          {status.targetRelease?.version ?? <EmptyCell />}
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Target set">
          {status.targetRelease?.timeRequested ? (
            <DateTime date={status.targetRelease.timeRequested} />
          ) : (
            'N/A'
          )}
        </PropertiesTable.Row>
        <PropertiesTable.Row
          label={
            <>
              Progress
              <TipIcon className="ml-1.5">
                Number of components updated to the target release
              </TipIcon>
            </>
          }
        >
          {componentProgress ? (
            <>
              <div className="mr-1.5">{componentProgress.percentage}%</div>
              <div className="text-secondary">
                ({componentProgress.current} of {componentProgress.total})
              </div>
            </>
          ) : (
            <EmptyCell />
          )}
        </PropertiesTable.Row>
        <PropertiesTable.Row
          label={
            <>
              Last step planned{' '}
              <TipIcon className="ml-1.5">
                A rough indicator of the last time the update planner did something
              </TipIcon>
            </>
          }
        >
          <DateTime date={status.timeLastStepPlanned} />
        </PropertiesTable.Row>
        <PropertiesTable.Row
          label={
            <>
              Suspended{' '}
              <TipIcon className="ml-1.5">
                Whether automatic update is suspended due to manual update activity
              </TipIcon>
            </>
          }
        >
          {
            // TODO: need a better T/F indicator
            status.suspended ? 'True' : 'False'
          }
        </PropertiesTable.Row>
      </PropertiesTable>

      <CardBlock>
        <CardBlock.Header title="Available Releases">
          <Button size="sm" onClick={() => setUploadModalOpen(true)}>
            Upload Release
          </Button>
        </CardBlock.Header>
        <CardBlock.Body>
          <div className="space-y-3">
            {repos.items.map((repo) => {
              const isTarget = repo.systemVersion === status.targetRelease?.version
              return (
                <div
                  key={repo.hash}
                  className="flex items-center gap-4 rounded border p-4 border-secondary"
                >
                  <Images24Icon className="shrink-0 text-secondary" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sans-semi-lg text-raise">
                        {repo.systemVersion}
                      </span>
                      {isTarget && <Badge color="default">Target</Badge>}
                    </div>
                    <div className="text-secondary">{repo.fileName}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Time16Icon />
                      <DateTime date={repo.timeCreated} />
                    </div>
                  </div>
                  <MoreActionsMenu label={`${repo.systemVersion} actions`} isSmall>
                    <DropdownMenu.Item
                      label="Set as target release"
                      onSelect={() => {
                        confirmAction({
                          actionType: 'primary',
                          doAction: () =>
                            setTargetRelease({
                              body: { systemVersion: repo.systemVersion },
                            }),
                          modalTitle: 'Confirm set target release',
                          modalContent: (
                            <p>
                              Are you sure you want to set <HL>{repo.systemVersion}</HL> as
                              the target release?
                            </p>
                          ),
                          errorTitle: `Error setting target release to ${repo.systemVersion}`,
                        })
                      }}
                      // TODO: follow API logic, disabling for older releases.
                      // Or maybe just have the API tell us by adding a field to
                      // the TufRepo response type.
                      disabled={isTarget && 'Already set as target'}
                    />
                  </MoreActionsMenu>
                </div>
              )
            })}
          </div>
        </CardBlock.Body>
      </CardBlock>

      {uploadModalOpen && <UploadReleaseModal onDismiss={closeUploadModal} />}
    </>
  )
}

type UploadFormValues = {
  releaseFile: File | null
}

const defaultValues: UploadFormValues = { releaseFile: null }

function UploadReleaseModal({ onDismiss }: { onDismiss: () => void }) {
  const form = useForm({ defaultValues })
  const selectedFile = form.watch('releaseFile')

  const {
    mutateAsync: uploadRelease,
    isPending: isUploading,
    error: uploadError,
    reset: resetUpload,
  } = useApiMutation('systemUpdateRepositoryUpload', {
    onSuccess(data) {
      queryClient.invalidateEndpoint('systemUpdateRepositoryList')
      addToast({
        content:
          data.status === 'already_exists' ? (
            <>
              Release <HL>{data.repo.systemVersion}</HL> already exists
            </>
          ) : (
            <>
              Uploaded release <HL>{data.repo.systemVersion}</HL>
            </>
          ),
      })
    },
  })

  const closeModal = () => {
    onDismiss()
    form.reset()
    resetUpload()
  }

  const handleUpload = form.handleSubmit(async (values) => {
    const file = values.releaseFile
    if (!file) return

    await uploadRelease({ query: { fileName: file.name } })
    closeModal()
  })

  return (
    <Modal isOpen onDismiss={closeModal} title="Upload Release">
      <form id="upload-form" onSubmit={handleUpload}>
        <Modal.Section>
          {uploadError && (
            <Message variant="error" title="Error" content={uploadError.message} />
          )}
          <FileField
            id="release-file-input"
            name="releaseFile"
            label="Release file"
            control={form.control}
            required
          />
        </Modal.Section>
      </form>
      <Modal.Footer
        formId="upload-form"
        onDismiss={closeModal}
        actionText="Upload"
        actionLoading={isUploading}
        disabled={!selectedFile || isUploading}
      />
    </Modal>
  )
}
