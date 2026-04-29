/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { skipToken, useQuery } from '@tanstack/react-query'
import cn from 'classnames'
import { Cause, Effect, Exit, Fiber, Layer, Schedule } from 'effect'
import { filesize } from 'filesize'
import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { api, q, queryClient, type ApiError, type BlockSize } from '@oxide/api'
import {
  Error12Icon,
  OpenLink12Icon,
  Success12Icon,
  Unauthorized12Icon,
} from '@oxide/design-system/icons/react'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { FileField } from '~/components/form/fields/FileField'
import { NameField } from '~/components/form/fields/NameField'
import { RadioField } from '~/components/form/fields/RadioField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useProjectSelector } from '~/hooks/use-params'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { Progress } from '~/ui/lib/Progress'
import { Spinner } from '~/ui/lib/Spinner'
import { readBlobAsBase64 } from '~/util/file'
import { invariant } from '~/util/invariant'
import { docLinks, links } from '~/util/links'
import { pb } from '~/util/path-builder'
import { isAllZeros } from '~/util/str'
import { GiB, KiB } from '~/util/units'

import {
  DiskApi,
  ImageApi,
  liveDiskApi,
  liveImageApi,
  liveSnapshotApi,
  SnapshotApi,
} from './image-upload-services'

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
}

function Step({ children, state, label, className }: StepProps) {
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
    // data-status used only for e2e testing
    <div
      className={cn('upload-step flex gap-2 px-4 py-3', className)}
      data-testid={`upload-step: ${label}`}
      data-status={status}
    >
      {/* padding on icon to align it with text since everything is aligned to top */}
      <div className="pt-px">{icon}</div>
      <div className={cn('w-full space-y-2', state.isError ? 'text-error' : 'text-raise')}>
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

/**
 * Crucible currently enforces a limit of 512 KiB. See [crucible
 * source](https://github.com/oxidecomputer/crucible/blob/c574ff1232/pantry/src/pantry.rs#L239-L253).
 */
const CHUNK_SIZE_BYTES = 512 * KiB

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

export const handle = titleCrumb('Upload image')

/**
 * Upload an image. Opens a second modal to show upload progress.
 */
export default function ImageCreate() {
  const navigate = useNavigate()
  const { project } = useProjectSelector()

  // The state in this component is very complex because we are doing a bunch of
  // requests in order, all of which can fail, plus the whole thing can be
  // aborted. We have the usual form state, plus an additional validation step
  // where we check the API to make sure the name is not taken.
  //
  // The upload itself runs as a single Effect program; per-step mutation state
  // is gone. Step icons are stubbed until the StepStatus service ships in step 7.

  const [formError, setFormError] = useState<ApiError | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  // progress bar, 0-100
  const [uploadProgress, setUploadProgress] = useState(0)

  // true while the upload Effect is in flight; gates the submit button
  const [running, setRunning] = useState(false)

  const backToImages = () => navigate(pb.projectImages({ project }))

  // done with everything, ready to close the modal
  const [allDone, setAllDone] = useState(false)

  // Handle to the running upload fiber so the cancel button can interrupt it.
  // Fiber.interrupt walks the tree, aborts in-flight fetches via the signal
  // forwarded by tryPromise, and runs every acquireRelease finalizer in reverse
  // acquisition order — no AbortController plumbing on this side.
  const fiberRef = useRef<Fiber.RuntimeFiber<void, ApiError> | null>(null)

  const layer = useMemo(
    () =>
      Layer.mergeAll(
        liveDiskApi({ project }),
        liveImageApi({ project }),
        liveSnapshotApi({ project })
      ),
    [project]
  )

  function closeModal() {
    if (allDone) {
      backToImages()
      return
    }

    // if we're still going, need to confirm cancellation. if we have an error,
    // everything is already stopped
    if (modalError || confirm('Are you sure? Closing the modal will cancel the upload.')) {
      cancelUpload()
      resetMainFlow()
      setModalOpen(false)
    }
  }

  function cancelUpload() {
    const fiber = fiberRef.current
    if (fiber) Effect.runFork(Fiber.interrupt(fiber))
  }

  function resetMainFlow() {
    setModalError(null)
    setUploadProgress(0)
  }

  function uploadFlow({
    imageName,
    imageDescription,
    imageFile,
    blockSize,
    os,
    version,
  }: FormValues & { imageFile: File }) {
    return Effect.scoped(
      Effect.gen(function* () {
        const diskApi = yield* DiskApi
        const imageApi = yield* ImageApi
        const snapshotApi = yield* SnapshotApi

        // Acquire the temp disk under a scoped finalizer. The release runs on
        // success, failure, and interrupt — replacing the imperative cleanup()
        // and the snapshot/disk refs that tracked which were live. State-aware
        // shutdown lives next to the acquire, where it belongs.
        const created = yield* Effect.acquireRelease(
          diskApi.create({
            name: getTmpDiskName(imageName),
            description: `temporary disk for importing image ${imageName}`,
            diskBackend: {
              type: 'distributed',
              diskSource: { type: 'importing_blocks', blockSize },
            },
            size: Math.ceil(imageFile.size / GiB) * GiB,
          }),
          (d) =>
            Effect.gen(function* () {
              const fresh = yield* diskApi.view(d.id)
              const state = fresh.state.state
              if (state === 'importing_from_bulk_writes') {
                yield* diskApi.bulkWriteStop(d.id)
                yield* diskApi.finalize(d.id, {})
              } else if (state === 'import_ready') {
                yield* diskApi.finalize(d.id, {})
              }
              yield* diskApi.delete(d.id)
            }).pipe(Effect.orDie)
        )

        // set disk to state importing-via-bulk-write
        yield* diskApi.bulkWriteStart(created.id)

        // Post file to the API in chunks of size `maxChunkSize`. Browsers cap
        // concurrent fetches at 6 per host, so Effect.forEach with concurrency 6
        // keeps us from reading more into memory than we can POST.

        const nChunks = Math.ceil(imageFile.size / CHUNK_SIZE_BYTES)

        // TODO: try to warn user if they try to close the tab while this is going

        let chunksProcessed = 0

        const postChunk = (i: number) =>
          Effect.gen(function* () {
            const offset = i * CHUNK_SIZE_BYTES
            const end = Math.min(offset + CHUNK_SIZE_BYTES, imageFile.size)
            const base64EncodedData = yield* Effect.promise(() =>
              readBlobAsBase64(imageFile.slice(offset, end))
            )

            // Disk space is all zeros by default, so we can skip any chunks that are
            // all zeros. It turns out this happens a lot.
            if (!isAllZeros(base64EncodedData)) {
              yield* diskApi
                .bulkWrite(created.id, { offset, base64EncodedData })
                .pipe(Effect.timeout('30 seconds'), Effect.retry(Schedule.recurs(2)))
            }
            chunksProcessed++
            setUploadProgress(Math.round((100 * chunksProcessed) / nChunks))
          })

        // avoid pointless array of size 4000 for a 2gb image
        function* genChunks() {
          for (let i = 0; i < nChunks; i++) yield i
        }

        yield* Effect.forEach(genChunks(), postChunk, { concurrency: 6 })

        yield* diskApi.bulkWriteStop(created.id)

        const snapshotName = `tmp-snapshot-${randInt()}`
        yield* diskApi.finalize(created.id, { snapshotName })

        // diskFinalizeImport does not return the snapshot, but create image
        // requires an ID. Acquire it under a finalizer too so the temp snapshot
        // is cleaned up regardless of how this scope exits.
        const createdSnapshot = yield* Effect.acquireRelease(
          snapshotApi.view(snapshotName),
          (s) => snapshotApi.delete(s.id).pipe(Effect.orDie)
        )

        // TODO: we checked at the beginning that the image name was free, but it
        // could be taken during upload. If this fails with object already exists,
        // don't delete the snapshot (could still delete the disk). Instead, link
        // user to snapshot detail and tell them to go there and create the image
        // from it.
        yield* imageApi.create({
          name: imageName,
          description: imageDescription,
          os,
          version,
          source: { type: 'snapshot', id: createdSnapshot.id },
        })

        // Scope closes here. Finalizers run in reverse acquisition order:
        // snapshot delete, then state-aware disk cleanup + delete.
      })
    )
  }

  async function onSubmit(values: FormValues) {
    invariant(values.imageFile, 'imageFile must exist') // file is a required field

    // this is done up here instead of next to the upload step because after
    // upload is canceled, a few outstanding bulk writes will complete, setting
    // uploadProgress to non-zero values. if we do this reset down there instead
    // of up here, cancel and retry will bring up a modal briefly showing the
    // previous run's progress, and it resets only when bulk upload starts
    resetMainFlow()
    setModalOpen(true)
    setRunning(true)

    const fiber = Effect.runFork(
      uploadFlow({ ...values, imageFile: values.imageFile }).pipe(Effect.provide(layer))
    )
    fiberRef.current = fiber

    try {
      const exit = await Effect.runPromise(Fiber.await(fiber))
      if (Exit.isSuccess(exit)) {
        setAllDone(true)
      } else if (!Cause.isInterruptedOnly(exit.cause)) {
        // not just an interrupt — actual failure (mid-flow or in a finalizer)
        console.error(Cause.pretty(exit.cause))
        setModalError('Something went wrong. Please try again.')
      }
    } finally {
      fiberRef.current = null
      setRunning(false)
    }
  }

  const form = useForm({ defaultValues })
  const file = form.watch('imageFile')
  const blockSize = form.watch('blockSize')

  const { data: imageValidation } = useQuery({
    queryKey: ['validateImage', ...(file ? [file.name, file.size, file.lastModified] : [])],
    queryFn: file ? () => validateImage(file) : skipToken,
  })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="image"
      title="Upload image"
      onDismiss={backToImages}
      onSubmit={async (values) => {
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
          // TODO: set this error on the field instead of the whole form
          // TODO: make setError available here somehow :(
          setFormError({
            errorCode: 'ObjectAlreadyExists',
            message: 'Image name already exists',
          })
          return
        }

        // onSubmit owns its lifecycle: failures are surfaced via modalError,
        // interrupts are silent, and acquireRelease finalizers handle cleanup.
        // No try/catch needed at this layer.
        await onSubmit(values)
      }}
      loading={running}
      submitError={formError}
      submitLabel={allDone ? 'Done' : 'Upload image'}
    >
      <NameField name="imageName" label="Name" control={form.control} />
      <DescriptionField
        name="imageDescription"
        label="Description"
        control={form.control}
      />
      {/* TODO: are OS and Version supposed to be non-empty? I doubt the API cares,
       * but it will be pretty for end users if they're empty
       */}
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
        {imageValidation && <BlockSizeNotice {...imageValidation} blockSize={blockSize} />}
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
      {file && modalOpen && (
        <Modal isOpen onDismiss={closeModal} title="Image upload progress">
          <Modal.Body className="p-0!">
            <Modal.Section className="p-0!">
              <div className="*:border-b-secondary *:border-b last:*:border-b-0">
                {modalError && (
                  <Message
                    variant="error"
                    title="Error"
                    content={modalError}
                    className="rounded-none! shadow-none!"
                  />
                )}
                <Step state={initSyntheticState} label="Create temporary disk" />
                <Step state={initSyntheticState} label="Put disk in import mode" />
                <Step state={initSyntheticState} label="Upload image file">
                  <div className="bg-default border-default rounded-lg border">
                    <div className="border-b-secondary flex justify-between border-b p-3 pb-2">
                      <div className="text-sans-md text-raise">{file.name}</div>
                      {/* cancel and/or pause buttons could go here */}
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
                </Step>
                <Step state={initSyntheticState} label="Get disk out of import mode" />
                <Step
                  state={initSyntheticState}
                  label="Finalize disk and create snapshot"
                />
                <Step state={initSyntheticState} label="Create image" duration={15} />
                <Step state={initSyntheticState} label="Delete disk and snapshot" />
                <Step
                  state={{
                    isPending: false,
                    isSuccess: allDone,
                    isError: false,
                  }}
                  label="Image uploaded successfully"
                  className={
                    allDone
                      ? 'bg-accent *:text-accent transition-colors'
                      : 'transition-colors'
                  }
                />
              </div>
            </Modal.Section>
          </Modal.Body>
          <Modal.Footer
            onDismiss={closeModal}
            onAction={backToImages}
            actionText="Done"
            cancelText={modalError || allDone ? 'Back' : 'Cancel'}
            disabled={!allDone}
          />
        </Modal>
      )}
      <SideModalFormDocs docs={[docLinks.images]} />
    </SideModalForm>
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
