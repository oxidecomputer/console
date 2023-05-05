import cn from 'classnames'
import filesize from 'filesize'
import pMap from 'p-map'
import pRetry from 'p-retry'
import { useRef, useState } from 'react'
import { Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'

import type { BlockSize, Disk, ErrorResult, Snapshot } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import {
  Error12Icon,
  FieldLabel,
  FileInput,
  Modal,
  Progress,
  Spinner,
  Success12Icon,
  Unauthorized12Icon,
} from '@oxide/ui'
import { GiB, KiB } from '@oxide/util'

import {
  DescriptionField,
  NameField,
  RadioField,
  SideModalForm,
  TextField,
} from 'app/components/form'
import { ErrorMessage } from 'app/components/form/fields/ErrorMessage'
import { useProjectSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

/** async wrapper for reading a slice of a file */
async function readBlobAsBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const fileReader = new FileReader()

    // split on comma and pop because data URL looks like
    // 'data:[<mediatype>][;base64],<data>' and we only want <data>.
    // e.target is never null and result is always a string
    fileReader.onload = function (e) {
      const base64Chunk = (e.target!.result as string).split(',').pop()!
      resolve(base64Chunk)
    }

    fileReader.readAsDataURL(blob)
  })
}

/** Format file size with two decimal points */
const fsize = (bytes: number) => filesize(bytes, { base: 2, pad: true })

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
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}

const initSyntheticState: MutationState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
}

type StepProps = {
  children?: React.ReactNode
  state: MutationState
  label: string
  duration?: number
}

function Step({ children, state, label }: StepProps) {
  /* eslint-disable react/jsx-key */
  const [status, icon] = state.isSuccess
    ? ['complete', <Success12Icon className="text-accent" />]
    : state.isLoading
    ? ['running', <Spinner />]
    : state.isError
    ? ['error', <Error12Icon className="text-error" />]
    : ['ready', <Unauthorized12Icon className="text-disabled" />]
  /* eslint-enable react/jsx-key */
  return (
    // data-status used only for e2e testing
    <div className="items-top flex gap-2 py-3 px-4" data-status={status}>
      {/* padding on icon to align it with text since everything is aligned to top */}
      <div className="pt-px">{icon}</div>
      <div
        className={cn('w-full space-y-2', state.isError ? 'text-error' : 'text-default')}
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
 * base64 encoding increases the size of the data by 1/3, so we need to
 * compensate for that. In many contexts (like email attachements), headers and
 * line breaks can introduce up 4% more overhead, but that doesn't apply here
 * because we are only sending the encoded data itself.
 */
const CHUNK_SIZE = Math.floor((512 * KiB * 3) / 4)

// States
//
// - Form
//   - Clean or filled
//   - Error
//   - Checking that image name isn't taken (back to form if taken)
// - Upload in progress
//   - Happy path
//     - Create disk
//     - Import start
//     - Uploading
//     - Import stop
//     - Finalize disk + create snapshot
//     - Create image from snapshot
//     - Cleanup
//   - Error
//     - Show error, click here to try again
//       - If we failed after upload complete, maybe try again from there?
//       - Otherwise, restart everything
//     - If image name got taken in the meantime, give chance to rename?
//
// Part of the problem is that I'm relying on RQ for the state of the upload
// steps, but there's slippage with what I actually want that to represent

// TODO: make sure cleanup, cancelEverything, and resetMainFlow are called in
// the right places

/**
 * Upload an image. Opens a second modal to show upload progress.
 */
export function CreateImageSideModalForm() {
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()
  const { project } = useProjectSelector()

  // Note: abort currently only works if it fires during the upload file step.
  // We could make it work between the other steps by calling
  // `abortController.throwIfAborted()` after each one. We could technically
  // plumb through the signal to the requests themselves, but they complete so
  // quickly it's probably not necessary.

  // The state in this component is very complex because we are doing a bunch of
  // requests in order, all of which can fail, plus the whole thing can be
  // aborted. We have the usual form state, plus an additional validation step
  // where we check the API to make sure the name is not taken. Then, while we
  // are submitting, we rely on the RQ mutations themselves, plus a synthetic
  // mutation state representing the many calls of the bulk upload step.

  const [formError, setFormError] = useState<ErrorResult | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  // progress bar, 0-100
  const [uploadProgress, setUploadProgress] = useState(0)

  const backToImages = () => navigate(pb.projectImages({ project }))

  // done as ref (global var) to avoid init in onSubmit and passing it around
  const abortController = useRef<AbortController | null>(null)

  // done with everything, ready to close the modal
  const [allDone, setAllDone] = useState(false)

  const createDisk = useApiMutation('diskCreate')
  const startImport = useApiMutation('diskBulkWriteImportStart')
  const uploadChunk = useApiMutation('diskBulkWriteImport')

  // synthetic state for upload step because it consists of multiple requests
  const [syntheticUploadState, setSyntheticUploadState] =
    useState<MutationState>(initSyntheticState)

  const stopImport = useApiMutation('diskBulkWriteImportStop')
  const finalizeDisk = useApiMutation('diskFinalizeImport')
  const createImage = useApiMutation('imageCreate')
  const deleteDisk = useApiMutation('diskDelete')
  const deleteSnapshot = useApiMutation('snapshotDelete')

  // TODO: Distinguish cleanup mutations being called after successful run vs.
  // due to error. In the former case, they have their own steps to highlight as
  // successful. In the latter, we do not want to highlight the steps.

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
  const stopImportCleanup = useApiMutation('diskBulkWriteImportStop')
  const finalizeDiskCleanup = useApiMutation('diskFinalizeImport')
  const deleteDiskCleanup = useApiMutation('diskDelete')
  const deleteSnapshotCleanup = useApiMutation('snapshotDelete')

  const cleanupMutations = [
    stopImportCleanup,
    finalizeDiskCleanup,
    deleteDiskCleanup,
    deleteSnapshotCleanup,
  ]

  const allMutations = [...mainFlowMutations, syntheticUploadState, ...cleanupMutations]

  // we don't want to be able to click submit while anything is running
  const formLoading = allMutations.some((m) => m.isLoading)

  // the created snapshot and disk. presence used in cleanup to decide whether we need to
  // attempt to delete them
  const snapshot = useRef<Snapshot | null>(null)
  const disk = useRef<Disk | null>(null)

  // if closeModal runs during bulk upload due to a cancel, cancelEverything
  // causes an abort of the bulk upload, which throws an error to onSubmit's
  // catch, which calls `cleanup`. so when we call cleanup here, it will be a
  // double cleanup. we could get rid of this one, but for the rare cancel *not*
  // during bulk upload we will still want to call cleanup. rather than
  // coordinating when to cleanup, we make cleanup idempotent by having it check
  // whether it has already been run, or more concretely before each action,
  // check whether it needs to be done
  async function closeModal() {
    if (allDone) {
      backToImages()
      return
    }

    // if we're still going, need to confirm cancelation. if we have an error,
    // everything is already stopped
    if (modalError || confirm('Are you sure? Closing the modal will cancel the upload.')) {
      cancelEverything()
      // TODO: probably shouldn't await this, but we do need to catch errors
      cleanup()
      resetMainFlow()
      setModalOpen(false)
    }
  }

  function cancelEverything() {
    abortController.current?.abort(ABORT_ERROR)
  }

  function resetMainFlow() {
    setModalError(null)
    setUploadProgress(0)
    mainFlowMutations.forEach((m) => m.reset())
    setSyntheticUploadState(initSyntheticState)
  }

  const cleaningUp = useRef(false)

  /** If a snapshot or disk was created, clean it up*/
  async function cleanup() {
    // don't run if already running
    if (cleaningUp.current) return
    cleaningUp.current = true

    if (snapshot.current) {
      await deleteSnapshotCleanup.mutateAsync({ path: { snapshot: snapshot.current.id } })
      snapshot.current = null
    }

    if (disk.current) {
      // we won't be able to delete the disk unless it's out of import mode
      const path = { disk: disk.current.id }
      const freshDisk = await queryClient.fetchQuery('diskView', { path })
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
    cleaningUp.current = false
  }

  async function onSubmit({
    imageName,
    imageDescription,
    imageFile,
    blockSize,
    os,
    version,
  }: FormValues) {
    invariant(imageFile) // shouldn't be possible to fail bc file is a required field

    // this is done up here instead of next to the upload step because after
    // upload is canceled, a few outstanding bulk writes will complete, setting
    // uploadProgress to non-zero values. if we do this reset down there instead
    // of up here, cancel and retry will bring up a modal briefly showing the
    // previous run's progress, and it resets only when bulk upload starts
    resetMainFlow()

    setModalOpen(true)

    // Create a disk in state import-ready
    const diskName = getTmpDiskName(imageName)
    disk.current = await createDisk.mutateAsync({
      query: { project },
      body: {
        name: diskName,
        description: `temporary disk for importing image ${imageName}`,
        diskSource: { type: 'importing_blocks', blockSize },
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
    // concurrent fetches at 6 per host. If we ran without a concurrency limit,
    // we'd read way more chunks into memory than we're ready to POST, and we'd
    // be sitting around waiting for the browser to let the fetches through.
    // That sounds bad. So we use pMap to process at most 6 chunks at a time.

    setSyntheticUploadState({ isLoading: true, isSuccess: false, isError: false })

    const nChunks = Math.ceil(imageFile.size / CHUNK_SIZE)

    // TODO: try to warn user if they try to close the tab while this is going

    let chunksProcessed = 0

    const postChunk = async (i: number) => {
      const offset = i * CHUNK_SIZE
      const end = Math.min(offset + CHUNK_SIZE, imageFile.size)
      const base64EncodedData = await readBlobAsBase64(imageFile.slice(offset, end))
      await uploadChunk
        .mutateAsync({ path, body: { offset, base64EncodedData } })
        .catch(() => {
          // this needs to throw a regular Error or pRetry gets mad
          throw Error(`Chunk ${i} (offset ${offset}) failed`)
        })
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
        setSyntheticUploadState({ isLoading: false, isSuccess: false, isError: true })
      }
      throw e // rethrow to get the usual the error handling in the wrapper function
    }

    setSyntheticUploadState({ isLoading: false, isSuccess: true, isError: false })

    await stopImport.mutateAsync({ path })
    abortController.current?.signal.throwIfAborted()

    const snapshotName = `tmp-snapshot-${randInt()}`
    await finalizeDisk.mutateAsync({ path, body: { snapshotName } })
    abortController.current?.signal.throwIfAborted()

    // diskFinalizeImport does not return the snapshot, but create image
    // requires an ID
    snapshot.current = await queryClient.fetchQuery('snapshotView', {
      path: { snapshot: snapshotName },
      query: { project },
    })
    abortController.current?.signal.throwIfAborted()

    // TODO: we checked at the beginning that the image name was free, but it
    // could be taken during upload. If this fails with object already exists,
    // don't delete the snapshot (could still delete the disk). Instead, link
    // user to snapshot detail and tell them to go there and create the image
    // from it.
    await createImage.mutateAsync({
      query: { project },
      body: {
        name: imageName,
        description: imageDescription,
        blockSize,
        os,
        version,
        source: { type: 'snapshot', id: snapshot.current.id },
      },
    })
    abortController.current?.signal.throwIfAborted()

    queryClient.invalidateQueries('imageList')

    // now delete the snapshot and the disk. don't use cleanup() because that
    // uses different mutations
    await deleteSnapshot.mutateAsync({ path: { snapshot: snapshot.current.id } })
    await deleteDisk.mutateAsync({ path: { disk: disk.current.id } })

    setAllDone(true)
  }

  return (
    <SideModalForm
      id="upload-image-form"
      formOptions={{ defaultValues }}
      title="Upload image"
      onDismiss={backToImages}
      onSubmit={async (values) => {
        // every submit needs its own AbortController because they can't be
        // reset
        abortController.current = new AbortController()

        setFormError(null)

        // check that image name isn't taken before starting the whole thing
        const image = await queryClient
          .fetchQuery('imageView', {
            path: { image: values.imageName },
            query: { project },
          })
          .catch((e) => {
            // eat a 404 since that's what we want. anything else should still blow up
            if (e.statusCode === 404) return null
            throw e
          })
        if (image) {
          // TODO: set this error on the field instead of the whole form
          // TODO: make setError available here somehow :(
          const message = 'Image name already exists'
          setFormError({
            type: 'client_error',
            error: { name: 'ObjectAlreadyExists', message },
            text: message,
            statusCode: 200,
            headers: new Headers(),
          })
          return
        }

        try {
          await onSubmit(values)
        } catch (e) {
          if (e !== ABORT_ERROR) {
            setModalError('Something went wrong. Please try again.')
          }
          cancelEverything()
          // user canceled
          await cleanup()
          // TODO: if we get here, show failure state in the upload modal
        }
      }}
      loading={formLoading}
      submitError={formError}
      submitLabel={allDone ? 'Done' : 'Upload image'}
    >
      {({ control, watch }) => {
        const file = watch('imageFile')
        return (
          <>
            <NameField name="imageName" label="Name" control={control} />
            <DescriptionField
              name="imageDescription"
              label="Description"
              control={control}
            />
            {/* TODO: are OS and Version supposed to be non-empty? I doubt the API cares,
             * but it will be pretty for end users if they're empty
             */}
            <TextField name="os" label="OS" control={control} required />
            <TextField name="version" control={control} required />
            <RadioField
              name="blockSize"
              label="Block size"
              units="Bytes"
              control={control}
              parseValue={(val) => parseInt(val, 10) as BlockSize}
              items={[
                { label: '512', value: 512 },
                { label: '2048', value: 2048 },
                { label: '4096', value: 4096 },
              ]}
            />
            <Controller
              name="imageFile"
              control={control}
              rules={{ required: true }}
              render={({ field: { value: _value, ...rest }, fieldState: { error } }) => (
                <div>
                  <FieldLabel id="image-file-input-label" htmlFor="image-file-input">
                    Image file
                    {error && (
                      <span className="ml-2">
                        <ErrorMessage error={error} label="File" />
                      </span>
                    )}
                  </FieldLabel>
                  {/*  TODO: this doesn't like being passed a ref because FileInput doesn't forward it */}
                  <FileInput id="image-file-input" className="mt-2" {...rest} />
                </div>
              )}
            />
            {file && modalOpen && (
              <Modal isOpen onDismiss={closeModal}>
                <Modal.Title>Image upload progress</Modal.Title>
                <Modal.Body>
                  <Modal.Section className="!p-0">
                    <div className="children:border-b children:border-b-secondary last:children:border-b-0">
                      <Step state={createDisk} label="Create temporary disk" />
                      <Step state={startImport} label="Put disk in import mode" />
                      <Step state={syntheticUploadState} label="Upload image file">
                        <div className="rounded-lg border bg-default border-default">
                          <div className="flex justify-between border-b p-3 pb-2 border-b-secondary">
                            <div className="text-sans-md text-default">{file.name}</div>
                            {/* cancel and/or pause buttons could go here */}
                          </div>
                          <div className="p-3 pt-2">
                            <div className="flex justify-between text-mono-sm">
                              <div className="!normal-case text-secondary">
                                {fsize((uploadProgress / 100) * file.size)}{' '}
                                <span className="text-quinary">/</span> {fsize(file.size)}
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
                      </Step>
                      <Step state={stopImport} label="Get disk out of import mode" />
                      <Step
                        state={finalizeDisk}
                        label="Finalize disk and create snapshot"
                      />
                      <Step state={createImage} label="Create image" duration={15} />
                      <Step
                        state={{
                          isLoading: deleteDisk.isLoading || deleteSnapshot.isLoading,
                          isSuccess: deleteDisk.isSuccess || deleteSnapshot.isSuccess,
                          isError: deleteDisk.isError || deleteSnapshot.isError,
                        }}
                        label="Delete disk and snapshot"
                      />
                    </div>
                  </Modal.Section>
                </Modal.Body>
                {/* TODO: rework Modal.Footer to let us write the buttons inline here instead of passing all these props */}
                <Modal.Footer
                  onDismiss={closeModal}
                  onAction={() => navigate(pb.projectImages({ project }))}
                  actionText="Done"
                  cancelText={modalError ? 'Back' : 'Cancel'}
                  disabled={!allDone}
                >
                  {/* TODO: style success message better */}
                  {allDone && <div>Image created!</div>}
                  {modalError && (
                    <div className="mr-4 flex grow items-start text-mono-sm text-error">
                      <Error12Icon className="mx-2 mt-0.5 shrink-0" />
                      <span>{modalError}</span>
                    </div>
                  )}
                </Modal.Footer>
              </Modal>
            )}
          </>
        )
      }}
    </SideModalForm>
  )
}
