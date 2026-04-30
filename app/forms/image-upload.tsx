/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { skipToken, useQuery } from '@tanstack/react-query'
import cn from 'classnames'
import { Cause, Effect, Exit, Fiber, Layer, Option } from 'effect'
import { filesize } from 'filesize'
import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { type ApiError, type BlockSize } from '@oxide/api'
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
import { invariant } from '~/util/invariant'
import { docLinks, links } from '~/util/links'
import { pb } from '~/util/path-builder'

import {
  ApiTransportError,
  ChunkUploadTimedOut,
  ImageNameTaken,
  liveDiskApi,
  liveImageApi,
  liveProgressReporter,
  liveSnapshotApi,
  liveStepStatus,
  liveUploadNames,
  liveUploadPolicy,
  submitProgram,
  type StepState,
  type StepStateMap,
  type UploadFailure,
} from './image-upload-workflow'

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

type StepProps = {
  children?: React.ReactNode
  state: StepState | undefined
  label: string
  duration?: number
  className?: string
}

function Step({ children, state, label, className }: StepProps) {
  /* eslint-disable react/jsx-key */
  const [status, icon] =
    state === 'success'
      ? ['complete', <Success12Icon className="text-accent" />]
      : state === 'running'
        ? ['running', <Spinner />]
        : state === 'error'
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
      <div
        className={cn('w-full space-y-2', state === 'error' ? 'text-error' : 'text-raise')}
      >
        <div>{label}</div>
        {children}
      </div>
    </div>
  )
}

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
  // The upload runs as a single Effect program. Per-step status and the
  // chunk-upload progress bar are pushed back into React state through the
  // StepStatus and ProgressReporter services, supplied as callback-shaped
  // layers so the workflow itself stays pure.

  const [formError, setFormError] = useState<ApiError | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  // progress bar, 0-100
  const [uploadProgress, setUploadProgress] = useState(0)

  // per-step status driven by the StepStatus service
  const [stepStates, setStepStates] = useState<StepStateMap>({})

  // true while the upload Effect is in flight; gates the submit button
  const [running, setRunning] = useState(false)

  const backToImages = () => navigate(pb.projectImages({ project }))

  // done with everything, ready to close the modal
  const [allDone, setAllDone] = useState(false)

  // Handle to the running upload fiber so the cancel button can interrupt it.
  // Fiber.interrupt walks the tree, aborts in-flight fetches via the signal
  // forwarded by tryPromise, and runs every acquireRelease finalizer in reverse
  // acquisition order — no AbortController plumbing on this side.
  const fiberRef = useRef<Fiber.RuntimeFiber<void, UploadFailure> | null>(null)

  // setStepStates and setUploadProgress are stable across renders, so the
  // layer only needs to rebuild when project changes.
  const layer = useMemo(
    () =>
      Layer.mergeAll(
        liveDiskApi({ project }),
        liveImageApi({ project }),
        liveSnapshotApi({ project }),
        liveUploadNames,
        liveUploadPolicy,
        liveStepStatus(setStepStates),
        liveProgressReporter(setUploadProgress)
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
    setStepStates({})
  }

  async function onSubmit(values: FormValues) {
    invariant(values.imageFile, 'imageFile must exist') // file is a required field

    setFormError(null)
    setRunning(true)

    // tracks whether onPrecheckPassed has fired, so we can route a failure to
    // setFormError (precheck never passed, modal not open) vs setModalError
    // (mid-upload, modal is open and visible)
    let prechecked = false

    const fiber = Effect.runFork(
      submitProgram({ ...values, imageFile: values.imageFile }, () => {
        prechecked = true
        resetMainFlow()
        setModalOpen(true)
      }).pipe(Effect.provide(layer))
    )
    fiberRef.current = fiber

    try {
      const exit = await Effect.runPromise(Fiber.await(fiber))
      if (Exit.isSuccess(exit)) {
        setAllDone(true)
        return
      }
      const failure = Cause.failureOption(exit.cause)
      if (Option.isSome(failure) && failure.value instanceof ImageNameTaken) {
        // TODO: set this error on the field instead of the whole form
        setFormError({
          errorCode: 'ObjectAlreadyExists',
          message: 'Image name already exists',
        })
      } else if (!Cause.isInterruptedOnly(exit.cause)) {
        console.error(Cause.pretty(exit.cause))
        const typedFailure = Option.isSome(failure) ? failure.value : undefined
        if (prechecked) {
          // failure happened during the upload — modal is open
          setModalError(uploadErrorMessage(typedFailure))
        } else {
          // failure happened during the precheck — modal never opened, so a
          // modal-level error would be invisible
          setFormError(precheckError(typedFailure))
        }
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
      onSubmit={onSubmit}
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
                <Step state={stepStates.createDisk} label="Create temporary disk" />
                <Step state={stepStates.importStart} label="Put disk in import mode" />
                <Step state={stepStates.upload} label="Upload image file">
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
                <Step state={stepStates.importStop} label="Get disk out of import mode" />
                <Step
                  state={stepStates.finalize}
                  label="Finalize disk and create snapshot"
                />
                <Step state={stepStates.createImage} label="Create image" duration={15} />
                <Step state={stepStates.cleanup} label="Delete disk and snapshot" />
                <Step
                  state={allDone ? 'success' : undefined}
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

function uploadErrorMessage(error: UploadFailure | undefined) {
  if (error instanceof ChunkUploadTimedOut) {
    return 'A chunk upload timed out. Please try again.'
  }
  if (error instanceof ApiTransportError) {
    return 'The upload could not reach the API. Please check your connection and try again.'
  }
  return error?.message || 'Something went wrong. Please try again.'
}

function precheckError(error: UploadFailure | undefined): ApiError {
  if (error instanceof ApiTransportError) {
    return {
      errorCode: 'NetworkError',
      message: 'Could not reach the API while checking the image name. Please try again.',
    }
  }
  return {
    errorCode: 'InternalError',
    message:
      error?.message || 'Something went wrong checking the image name. Please try again.',
  }
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
