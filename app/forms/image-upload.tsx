/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { skipToken, useQuery } from '@tanstack/react-query'
import cn from 'classnames'
import * as m from 'motion/react-m'
import pMap from 'p-map'
import pRetry from 'p-retry'
import { useEffect, useId, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import {
  api,
  q,
  queryClient,
  useApiMutation,
  type BlockSize,
  type Disk,
  type Snapshot,
} from '@oxide/api'
import {
  Error12Icon,
  OpenLink12Icon,
  Success12Icon,
  Unauthorized12Icon,
} from '@oxide/design-system/icons/react'

import { ConfirmModal } from '~/components/ConfirmModal'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { FileField } from '~/components/form/fields/FileField'
import { NameField } from '~/components/form/fields/NameField'
import { RadioField } from '~/components/form/fields/RadioField'
import { TextField } from '~/components/form/fields/TextField'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useProjectSelector } from '~/hooks/use-params'
import { useShouldAnimateModal } from '~/hooks/use-should-animate-modal'
import { addToast } from '~/stores/toast'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { Button } from '~/ui/lib/Button'
import { Message } from '~/ui/lib/Message'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { Progress } from '~/ui/lib/Progress'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { SideModal } from '~/ui/lib/SideModal'
import { Spinner } from '~/ui/lib/Spinner'
import { Truncate } from '~/ui/lib/Truncate'
import { anySignal } from '~/util/abort'
import { readBlobAsBase64 } from '~/util/file'
import { invariant } from '~/util/invariant'
import { docLinks, links } from '~/util/links'
import { pb } from '~/util/path-builder'
import { isAllZeros } from '~/util/str'
import { bytesToGiB, formatBytes, GiB, KiB } from '~/util/units'

// Padded because otherwise the numbers jump around a bit, e.g., when it goes
// from 10.55 to 14.7 to 19.23
const fsize = (bytes: number) => formatBytes(bytes, { pad: true }).label
const genericUploadErrorMessage = 'Something went wrong. Please try again.'

function getUploadErrorMessage(e: unknown): string {
  if (!e || typeof e !== 'object') return genericUploadErrorMessage
  const errorCode = 'errorCode' in e ? e.errorCode : undefined
  const message = 'message' in e ? e.message : undefined

  // Mutation errors are ApiErrors with user-facing messages from
  // processServerError. Show the API message only when it's actually
  // user-facing: errorCode "Internal" maps to dropshot's generic 500
  // ("Internal Server Error") with no real detail, and a missing message
  // means we got nothing to display.
  return typeof errorCode === 'string' &&
    typeof message === 'string' &&
    errorCode !== 'Internal'
    ? message
    : genericUploadErrorMessage
}

type FormValues = {
  imageName: string
  imageDescription: string
  os: string
  version: string
  blockSize: BlockSize
  imageFile: File | null
}

const defaultValues: FormValues = {
  imageName: '',
  imageDescription: '',
  os: '',
  version: '',
  blockSize: 512,
  imageFile: null,
}

// subset of the mutation state we care about
type MutationState = {
  isPending: boolean
  isSuccess: boolean
  isError: boolean
}

const initSyntheticState: MutationState = {
  isPending: false,
  isSuccess: false,
  isError: false,
}

type StepProps = {
  children?: React.ReactNode
  state: MutationState
  label: string
  duration?: number
  className?: string
  /** When true, sets aria-current="step" and accepts a ref for focus management */
  active?: boolean
  stepRef?: React.Ref<HTMLDivElement>
}

function Step({ children, state, label, className, active, stepRef }: StepProps) {
  /* eslint-disable react/jsx-key */
  const [status, icon] = state.isSuccess
    ? ['complete', <Success12Icon className="text-accent" />]
    : state.isPending
      ? ['running', <Spinner />]
      : state.isError
        ? ['error', <Error12Icon className="text-error" />]
        : ['ready', <Unauthorized12Icon className="text-disabled" />]
  /* eslint-enable react/jsx-key */
  return (
    <div
      ref={stepRef}
      tabIndex={-1}
      className={cn(
        'upload-step flex items-baseline gap-2 px-8 py-3 outline-none',
        state.isPending && 'text-raise',
        className
      )}
      data-testid={`upload-step: ${label}`}
      data-status={status}
      aria-current={active ? 'step' : undefined}
    >
      {/* padding on icon to align it with text since everything is aligned to top */}
      <div className="">{icon}</div>
      <div
        className={cn(
          'w-full space-y-2 text-sans-md',
          state.isError ? 'text-error' : 'text-raise'
        )}
      >
        <div>{label}</div>
        {children}
      </div>
    </div>
  )
}

const randInt = () => Math.floor(Math.random() * 100000000)

function getTmpDiskName(imageName: string) {
  if (process.env.NODE_ENV === 'development') {
    // this is only here for testing purposes. because we normally generate a
    // random tmp disk name, we have to not do that if we want to pass special
    // values to MSW to get it to do error things for us. If we pass special
    // values as the image name, use the same value as the disk name and we'll
    // do the right thing in
    const specialNames = new Set([
      'disk-create-500',
      'disk-create-quota',
      'import-start-500',
      'import-stop-500',
      'disk-finalize-500',
    ])
    if (specialNames.has(imageName)) return imageName
  }

  return `tmp-for-image-${randInt()}`
}

// TODO: do we need to distinguish between abort due to manual cancel and abort
// due to error?
const ABORT_ERROR = new Error('Upload canceled')

/**
 * Crucible currently enforces a limit of 512 KiB. See [crucible
 * source](https://github.com/oxidecomputer/crucible/blob/c574ff1232/pantry/src/pantry.rs#L239-L253).
 */
const CHUNK_SIZE_BYTES = 512 * KiB

export const handle = titleCrumb('Upload image')

type Phase = 'form' | 'progress'

function SummaryHeader({ values }: { values: FormValues }) {
  const file = values.imageFile
  return (
    <PropertiesTable className="mb-4 basis-[initial]">
      <PropertiesTable.Row label="Name">{values.imageName}</PropertiesTable.Row>
      <PropertiesTable.Row label="OS">
        {values.os ? values.os : <EmptyCell />}
      </PropertiesTable.Row>
      <PropertiesTable.Row label="Version">
        {values.version ? values.version : <EmptyCell />}
      </PropertiesTable.Row>
      <PropertiesTable.Row label="Block size">
        {values.blockSize} <span className="text-tertiary ml-1 inline-block">B</span>
      </PropertiesTable.Row>
      {file && (
        <PropertiesTable.Row label="File name">
          <Truncate maxLength={120} text={file.name} />
        </PropertiesTable.Row>
      )}
      {file && (
        <PropertiesTable.Row label="File size">
          <span>{bytesToGiB(file.size)}</span>
          <span className="text-tertiary ml-1 inline-block">GiB</span>
        </PropertiesTable.Row>
      )}
    </PropertiesTable>
  )
}

/**
 * Upload an image. Swaps between a form phase and a progress phase inside a
 * single side modal — no second modal is mounted.
 */
export default function ImageCreate() {
  const navigate = useNavigate()
  const { project } = useProjectSelector()
  const formId = useId()
  const animate = useShouldAnimateModal()

  const [phase, setPhase] = useState<Phase>('form')
  const [showCancelGuard, setShowCancelGuard] = useState(false)
  const [showNavGuard, setShowNavGuard] = useState(false)

  const [formError, setFormError] = useState<{ message: string } | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)

  // progress bar, 0-100
  const [uploadProgress, setUploadProgress] = useState(0)

  const backToImages = () => navigate(pb.projectImages({ project }))

  // done as ref (global var) to avoid init in onSubmit and passing it around
  const abortController = useRef<AbortController | null>(null)

  // done with everything, ready to close the modal
  const [allDone, setAllDone] = useState(false)

  // true while cleanup() is awaiting after a cancel/error, so the form footer
  // can explain why the resubmit button is in a loading state
  const [isCleaningUp, setIsCleaningUp] = useState(false)

  // for restoring focus when returning from progress to form
  const previousFocusRef = useRef<HTMLElement | null>(null)
  // first step row, focused on phase change to progress
  const firstStepRef = useRef<HTMLDivElement | null>(null)

  const createDisk = useApiMutation(api.diskCreate)
  const startImport = useApiMutation(api.diskBulkWriteImportStart)

  // gcTime: 0 prevents the mutation cache from holding onto all the chunks for
  // 5 minutes. It can be a ton of memory.
  const uploadChunk = useApiMutation(api.diskBulkWriteImport, { gcTime: 0 })

  // synthetic state for upload step because it consists of multiple requests
  const [syntheticUploadState, setSyntheticUploadState] =
    useState<MutationState>(initSyntheticState)

  const stopImport = useApiMutation(api.diskBulkWriteImportStop)
  const finalizeDisk = useApiMutation(api.diskFinalizeImport)
  const createImage = useApiMutation(api.imageCreate)
  const deleteDisk = useApiMutation(api.diskDelete)
  const deleteSnapshot = useApiMutation(api.snapshotDelete)

  const mainFlowMutations = [
    createDisk,
    startImport,
    uploadChunk,
    stopImport,
    finalizeDisk,
    createImage,
    deleteDisk,
    deleteSnapshot,
  ]

  // separate so we can distinguish between cleanup due to error vs. cleanup after success
  const stopImportCleanup = useApiMutation(api.diskBulkWriteImportStop)
  const finalizeDiskCleanup = useApiMutation(api.diskFinalizeImport)
  // in production these invalidations are unlikely to matter, but they help a
  // lot in the tests when we check the disk list after canceling to make sure
  // the temp resources got deleted
  const deleteDiskCleanup = useApiMutation(api.diskDelete, {
    onSuccess() {
      queryClient.invalidateEndpoint('diskList')
    },
  })
  const deleteSnapshotCleanup = useApiMutation(api.snapshotDelete, {
    onSuccess() {
      queryClient.invalidateEndpoint('snapshotList')
    },
  })

  // the created snapshot and disk. presence used in cleanup to decide whether we need to
  // attempt to delete them
  const snapshot = useRef<Snapshot | null>(null)
  const disk = useRef<Disk | null>(null)

  // Aborting works for steps other than file upload despite the
  // signal not being used directly in the former because we call
  // `abortController.throwIfAborted()` after each step.
  function cancelEverything() {
    abortController.current?.abort(ABORT_ERROR)
  }

  function resetMainFlow() {
    setModalError(null)
    setUploadProgress(0)
    setAllDone(false)
    mainFlowMutations.forEach((m) => m.reset())
    setSyntheticUploadState(initSyntheticState)
  }

  /** If a snapshot or disk was created, clean it up*/
  async function cleanup() {
    if (snapshot.current) {
      await deleteSnapshotCleanup.mutateAsync({ path: { snapshot: snapshot.current.id } })
      snapshot.current = null
    }

    if (disk.current) {
      // we won't be able to delete the disk unless it's out of import mode
      const path = { disk: disk.current.id }
      const freshDisk = await queryClient.fetchQuery(q(api.diskView, { path }))
      const diskState = freshDisk.state.state
      if (diskState === 'importing_from_bulk_writes') {
        await stopImportCleanup.mutateAsync({ path })
        await finalizeDiskCleanup.mutateAsync({ path, body: {} })
      }
      if (diskState === 'import_ready') {
        // TODO: if this fails, there's no way to delete the disk. tell user?
        await finalizeDiskCleanup.mutateAsync({ path, body: {} })
      }
      await deleteDiskCleanup.mutateAsync({ path: { disk: disk.current.id } })
      disk.current = null
    }
  }

  async function runUpload({
    imageName,
    imageDescription,
    imageFile,
    blockSize,
    os,
    version,
  }: FormValues) {
    invariant(imageFile, 'imageFile must exist') // shouldn't be possible to fail bc file is a required field

    // Create a disk in state import-ready
    const diskName = getTmpDiskName(imageName)
    disk.current = await createDisk.mutateAsync({
      query: { project },
      body: {
        name: diskName,
        description: `temporary disk for importing image ${imageName}`,
        diskBackend: {
          type: 'distributed',
          diskSource: { type: 'importing_blocks', blockSize },
        },
        size: Math.ceil(imageFile.size / GiB) * GiB,
      },
    })

    // do these between each step to catch cancellations
    abortController.current?.signal.throwIfAborted()

    // set disk to state importing-via-bulk-write
    const path = { disk: disk.current.id }
    await startImport.mutateAsync({ path })

    abortController.current?.signal.throwIfAborted()

    // Post file to the API in chunks of size `maxChunkSize`. Browsers cap
    // concurrent fetches at 6 per host. So we use pMap to process at most 6
    // chunks at a time.
    setSyntheticUploadState({ isPending: true, isSuccess: false, isError: false })

    const nChunks = Math.ceil(imageFile.size / CHUNK_SIZE_BYTES)
    let chunksProcessed = 0

    const postChunk = async (i: number) => {
      const offset = i * CHUNK_SIZE_BYTES
      const end = Math.min(offset + CHUNK_SIZE_BYTES, imageFile.size)
      const base64EncodedData = await readBlobAsBase64(imageFile.slice(offset, end))

      // Disk space is all zeros by default, so we can skip any chunks that are
      // all zeros. It turns out this happens a lot.
      if (!isAllZeros(base64EncodedData)) {
        await uploadChunk
          .mutateAsync({
            path,
            body: { offset, base64EncodedData },
            // use both the abort signal for the whole upload and a per-request timeout
            __signal: anySignal([
              AbortSignal.timeout(30000),
              abortController.current?.signal,
            ]),
          })
          .catch(() => {
            // this needs to throw a regular Error or pRetry gets mad
            throw Error(`Chunk ${i} (offset ${offset}) failed`)
          })
      }
      chunksProcessed++
      setUploadProgress(Math.round((100 * chunksProcessed) / nChunks))
    }

    // avoid pointless array of size 4000 for a 2gb image
    function* genChunks() {
      for (let i = 0; i < nChunks; i++) yield i
    }

    // will throw if aborted or if requests error out
    try {
      await pMap(
        genChunks(),
        (i) => pRetry(() => postChunk(i), { retries: 2 }),
        // browser can only do 6 fetches at once, so we only read 6 chunks at once
        { concurrency: 6, signal: abortController.current?.signal }
      )
    } catch (e) {
      if (e !== ABORT_ERROR) {
        setSyntheticUploadState({ isPending: false, isSuccess: false, isError: true })
      }
      throw e // rethrow to get the usual the error handling in the wrapper function
    }

    setSyntheticUploadState({ isPending: false, isSuccess: true, isError: false })

    await stopImport.mutateAsync({ path })
    abortController.current?.signal.throwIfAborted()

    const snapshotName = `tmp-snapshot-${randInt()}`
    await finalizeDisk.mutateAsync({ path, body: { snapshotName } })
    abortController.current?.signal.throwIfAborted()

    // diskFinalizeImport does not return the snapshot, but create image
    // requires an ID
    snapshot.current = await queryClient.fetchQuery(
      q(api.snapshotView, {
        path: { snapshot: snapshotName },
        query: { project },
      })
    )
    abortController.current?.signal.throwIfAborted()

    // TODO: we checked at the beginning that the image name was free, but it
    // could be taken during upload. If this fails with object already exists,
    // don't delete the snapshot (could still delete the disk).
    await createImage.mutateAsync({
      query: { project },
      body: {
        name: imageName,
        description: imageDescription,
        os,
        version,
        source: { type: 'snapshot', id: snapshot.current.id },
      },
    })
    abortController.current?.signal.throwIfAborted()

    queryClient.invalidateEndpoint('imageList')

    // now delete the snapshot and the disk. don't use cleanup() because that
    // uses different mutations
    await deleteSnapshot.mutateAsync({ path: { snapshot: snapshot.current.id } })
    await deleteDisk.mutateAsync({ path: { disk: disk.current.id } })

    setAllDone(true)
  }

  /** Wraps runUpload with abort/cleanup/error handling. */
  async function runUploadGuarded(values: FormValues) {
    abortController.current = new AbortController()
    try {
      await runUpload(values)
    } catch (e) {
      if (e !== ABORT_ERROR) {
        console.error(e)
        setModalError(getUploadErrorMessage(e))
        // abort anything in flight in case
        cancelEverything()
      }
      // user canceled or error: clean up any partial state
      setIsCleaningUp(true)
      try {
        await cleanup()
      } finally {
        setIsCleaningUp(false)
      }
    } finally {
      abortController.current = null
    }
  }

  const form = useForm({ defaultValues })
  const file = form.watch('imageFile')
  const blockSize = form.watch('blockSize')

  const { data: imageValidation } = useQuery({
    queryKey: ['validateImage', ...(file ? [file.name, file.size, file.lastModified] : [])],
    queryFn: file ? () => validateImage(file) : skipToken,
  })

  async function onSubmit(values: FormValues) {
    setFormError(null)

    // check that image name isn't taken before starting the whole thing
    const image = await queryClient
      .fetchQuery(
        q(
          api.imageView,
          { path: { image: values.imageName }, query: { project } },
          {
            errorsExpected: {
              explanation: 'the image name may not exist yet.',
              statusCode: 404,
            },
          }
        )
      )
      .catch((e) => {
        // eat a 404 since that's what we want. anything else should still blow up
        if (e.statusCode === 404) return null
        throw e
      })
    if (image) {
      setFormError({ message: 'Image name already exists' })
      return
    }

    // stash currently focused element so we can restore it on cancel
    previousFocusRef.current = document.activeElement as HTMLElement | null

    setPhase('progress')
    await runUploadGuarded(values)
  }

  function backToForm() {
    // controller is still live → there's an in-flight upload to tear down.
    // show "Cleaning up…" right away rather than waiting for the catch in
    // runUploadGuarded, which only fires once the in-flight step throws.
    if (abortController.current) setIsCleaningUp(true)
    cancelEverything()
    resetMainFlow()
    setPhase('form')
    setShowCancelGuard(false)
    // defer focus restore until after re-render so the field is visible again
    setTimeout(() => previousFocusRef.current?.focus(), 0)
  }

  async function handleRetry() {
    resetMainFlow()
    await runUploadGuarded(form.getValues())
  }

  function handleDismiss() {
    if (phase === 'form') {
      if (form.formState.isDirty) {
        setShowNavGuard(true)
      } else {
        backToImages()
      }
      return
    }
    // progress phase: error path means upload is already aborted; allow exit
    if (modalError) {
      backToImages()
      return
    }
    // success: nothing to cancel; treat as Done (toast + close)
    if (allDone) {
      handleDone()
      return
    }
    // running: confirm before aborting
    setShowCancelGuard(true)
  }

  // move focus to the first step on phase change to progress
  useEffect(() => {
    if (phase === 'progress') {
      firstStepRef.current?.focus()
    }
  }, [phase])

  // If the run reaches a terminal state (success or error) while the cancel
  // guard is open, dismiss the guard so the outer modal can run its normal
  // success/error path. The user no longer has anything to cancel.
  useEffect(() => {
    if (allDone || modalError) setShowCancelGuard(false)
  }, [allDone, modalError])

  function handleDone() {
    const imageName = form.getValues('imageName')
    addToast({
      // prettier-ignore
      content: <>Image <HL>{imageName}</HL> uploaded</>,
      cta: {
        text: `View ${imageName}`,
        link: pb.projectImageEdit({ project, image: imageName }),
      },
    })
    backToImages()
  }

  // determine which step is the active one for aria-current
  const activeStepIndex = (() => {
    if (createDisk.isPending) return 0
    if (startImport.isPending) return 1
    if (syntheticUploadState.isPending) return 2
    if (stopImport.isPending) return 3
    if (finalizeDisk.isPending) return 4
    if (createImage.isPending) return 5
    if (deleteDisk.isPending || deleteSnapshot.isPending) return 6
    return -1
  })()

  // once createImage starts there's no abort checkpoint left and the snapshot/disk
  // deletes don't honor the signal, so cancellation would leave the image in place
  // while the UI pretends nothing happened
  const cancelDisabledReason =
    createImage.isPending || createImage.isSuccess
      ? 'Image has been created and can no longer be canceled'
      : undefined

  return (
    <SideModal
      title="Upload image"
      isOpen
      onDismiss={handleDismiss}
      animate={animate}
      errors={phase === 'form' && formError ? [formError.message] : undefined}
    >
      {phase === 'progress' && <SummaryHeader values={form.getValues()} />}
      <SideModal.Body>
        <div hidden={phase === 'progress'}>
          <form
            id={formId}
            className="ox-form"
            autoComplete="off"
            onSubmit={(e) => {
              e.stopPropagation()
              form.handleSubmit(onSubmit)(e)
            }}
          >
            <NameField name="imageName" label="Name" control={form.control} />
            <DescriptionField
              name="imageDescription"
              label="Description"
              control={form.control}
            />
            <TextField name="os" label="OS" control={form.control} required />
            <TextField name="version" control={form.control} required />
            <div className="flex w-full flex-col flex-wrap space-y-4">
              <RadioField
                name="blockSize"
                label="Block size"
                units="Bytes"
                control={form.control}
                parseValue={(val) => parseInt(val, 10) as BlockSize}
                items={[
                  { label: '512', value: 512 },
                  { label: '2048', value: 2048 },
                  { label: '4096', value: 4096 },
                ]}
              />
              {imageValidation && (
                <BlockSizeNotice {...imageValidation} blockSize={blockSize} />
              )}
            </div>
            <div className="flex w-full flex-col flex-wrap space-y-4">
              <FileField
                id="image-file-input"
                name="imageFile"
                label="Image file"
                required
                control={form.control}
              />
              {imageValidation && <BootableNotice {...imageValidation} />}
            </div>
            <SideModalFormDocs docs={[docLinks.images]} />
          </form>
        </div>
        {phase === 'progress' && (
          <div
            aria-label="Upload progress"
            aria-live="polite"
            className="*:border-b-secondary mx-0! -mt-8 *:border-b *:last:border-b-0"
          >
            {modalError && (
              <Message
                variant="error"
                title="Error"
                content={modalError}
                className="rounded-none! shadow-none!"
              />
            )}
            <Step
              state={createDisk}
              label="Create temporary disk"
              active={activeStepIndex === 0}
              stepRef={firstStepRef}
            />
            <Step
              state={startImport}
              label="Put disk in import mode"
              active={activeStepIndex === 1}
            />
            <Step
              state={syntheticUploadState}
              label="Upload image file"
              active={activeStepIndex === 2}
            >
              {file && (
                <div className="bg-default border-default rounded-lg border">
                  <div className="border-b-secondary flex justify-between border-b p-3 pb-2">
                    <div className="text-sans-md text-raise">{file.name}</div>
                  </div>
                  <div className="p-3 pt-2">
                    <div className="text-mono-sm flex justify-between">
                      <div className="text-default normal-case!">
                        {fsize((uploadProgress / 100) * file.size)}{' '}
                        <span className="text-quaternary">/</span> {fsize(file.size)}
                      </div>
                      <div className="text-accent">{uploadProgress}%</div>
                    </div>
                    <Progress
                      className="mt-1.5"
                      aria-label="Upload progress"
                      value={uploadProgress}
                    />
                  </div>
                </div>
              )}
            </Step>
            <Step
              state={stopImport}
              label="Get disk out of import mode"
              active={activeStepIndex === 3}
            />
            <Step
              state={finalizeDisk}
              label="Finalize disk and create snapshot"
              active={activeStepIndex === 4}
            />
            <Step
              state={createImage}
              label="Create image"
              duration={15}
              active={activeStepIndex === 5}
            />
            <Step
              state={{
                isPending: deleteDisk.isPending || deleteSnapshot.isPending,
                isSuccess: deleteDisk.isSuccess && deleteSnapshot.isSuccess,
                isError: deleteDisk.isError || deleteSnapshot.isError,
              }}
              label="Delete disk and snapshot"
              active={activeStepIndex === 6}
            />
            <Step
              state={{ isPending: false, isSuccess: allDone, isError: false }}
              label="Image uploaded"
              className={
                allDone ? 'bg-accent *:text-accent transition-colors' : 'transition-colors'
              }
            />
          </div>
        )}
      </SideModal.Body>
      <SideModal.Footer error={phase === 'form' && !!formError}>
        {phase === 'form' ? (
          <>
            {isCleaningUp && (
              <m.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 8 }}
                transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                className="text-sans-md flex grow items-center gap-1.5"
              >
                <Spinner />
                <span className="text-tertiary">Cleaning up…</span>
              </m.div>
            )}
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              form={formId}
              disabled={form.formState.isSubmitting}
            >
              Upload image
            </Button>
          </>
        ) : modalError ? (
          <>
            <Button variant="ghost" size="sm" onClick={backToForm}>
              Back to form
            </Button>
            <Button variant="primary" size="sm" onClick={handleRetry}>
              Retry from here
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCancelGuard(true)}
              disabled={!!cancelDisabledReason}
              disabledReason={cancelDisabledReason}
            >
              Cancel upload
            </Button>
            <Button variant="primary" size="sm" disabled={!allDone} onClick={handleDone}>
              Done
            </Button>
          </>
        )}
      </SideModal.Footer>

      <ConfirmModal
        isOpen={showCancelGuard}
        onDismiss={() => setShowCancelGuard(false)}
        onConfirm={backToForm}
        title="Cancel upload?"
        confirmText="Cancel upload"
        dismissText="Keep uploading"
      >
        All progress will be lost. Your form values are kept.
      </ConfirmModal>

      <ConfirmModal
        isOpen={showNavGuard}
        onDismiss={() => setShowNavGuard(false)}
        onConfirm={backToImages}
        title="Leave form?"
        confirmText="Leave form"
        dismissText="Keep editing"
      >
        Any unsaved changes will be lost.
      </ConfirmModal>
    </SideModal>
  )
}

function BlockSizeNotice({
  blockSize,
  efiPartOffset,
  isBootableCd,
}: {
  blockSize: number
  efiPartOffset: number
  isBootableCd: boolean
}) {
  const isEfi = efiPartOffset !== -1

  // If the image doesn't look bootable, return null (`BootableNotice` does the work).
  if (!isEfi && !isBootableCd) return null
  // If we detect `EFI BOOT` and the block size is set correctly return null.
  // (This includes hybrid GPT+ISO.)
  if (isEfi && blockSize === efiPartOffset) return null
  // If we detect only `CD001` and the block size is set correctly return null.
  if (!isEfi && isBootableCd && blockSize === 2048) return null

  // Block size is set incorrectly. If we detect `EFI BOOT`, always show that warning.
  const content = isEfi
    ? `Detected “EFI PART” marker at offset ${efiPartOffset}, but block size is set to ${blockSize}.`
    : 'Bootable CDs typically use a block size of 2048.'

  return (
    <Message variant="info" title="Block size might be set incorrectly" content={content} />
  )
}

function BootableNotice({
  efiPartOffset,
  isBootableCd,
  isCompressed,
}: {
  efiPartOffset: number
  isBootableCd: boolean
  isCompressed: boolean
}) {
  // this message should only appear if the image doesn't have a header
  // marker we are looking for and does not appear to be compressed
  const efiPartOrBootable = efiPartOffset !== -1 || isBootableCd
  if (efiPartOrBootable && !isCompressed) return null

  const content = (
    <div className="flex flex-col space-y-2">
      <ul className="ml-4 list-disc">
        {!efiPartOrBootable && (
          <li>
            <div>Bootable markers not found at any block size.</div>
            <div>
              Expected either “EFI PART” marker at offsets 512 / 2048 / 4096 or “CD001” at
              offset 0x8001 (for a bootable CD).
            </div>
          </li>
        )}
        {isCompressed && (
          <li>
            <div>This might be a compressed image.</div>
            <div>
              Only raw, uncompressed images are supported. Files such as qcow2, vmdk,
              img.gz, iso.7z may not work.
            </div>
          </li>
        )}
      </ul>
      <div>
        Learn more about{' '}
        <a
          target="_blank"
          rel="noreferrer"
          href={links.preparingImagesDocs}
          className="inline-flex items-center underline"
        >
          preparing images for import
          <OpenLink12Icon className="ml-1" />
        </a>
      </div>
    </div>
  )

  return (
    <Message
      variant="info"
      title="This image might not be bootable"
      className="*:space-y-2"
      content={content}
    />
  )
}

async function readAtOffset(file: File, offset: number, length: number) {
  const reader = new FileReader()

  const promise = new Promise<string | undefined>((resolve, reject) => {
    reader.onloadend = (e) => {
      if (
        e.target?.readyState === FileReader.DONE &&
        // should always be true because we're using readAsArrayBuffer
        e.target.result instanceof ArrayBuffer
      ) {
        resolve(String.fromCharCode(...new Uint8Array(e.target.result)))
        return
      }
      resolve(undefined)
    }

    reader.onerror = (error) => {
      const msg = `Error reading file at offset ${offset}:`
      console.error(msg, error)
      reject(new Error(msg))
    }
  })

  reader.readAsArrayBuffer(file.slice(offset, offset + length))
  return promise
}

async function getEfiPartOffset(file: File) {
  const offsets = [512, 2048, 4096]
  for (const offset of offsets) {
    const isMatch = (await readAtOffset(file, offset, 8)) === 'EFI PART'
    if (isMatch) return offset
  }
  return -1
}

const compressedExts = ['.gz', '.7z', '.qcow2', '.vmdk']

const validateImage = async (file: File) => {
  const lowerFileName = file.name.toLowerCase()
  return {
    efiPartOffset: await getEfiPartOffset(file),
    isBootableCd: (await readAtOffset(file, 0x8001, 5)) === 'CD001',
    isCompressed: compressedExts.some((ext) => lowerFileName.endsWith(ext)),
  }
}
