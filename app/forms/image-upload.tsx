import cn from 'classnames'
import filesize from 'filesize'
import pMap from 'p-map'
import pRetry from 'p-retry'
import { useMemo, useRef, useState } from 'react'
import { Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'

import type { BlockSize, Disk, Snapshot } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Checkmark12Icon, FieldLabel, Progress, Wrap } from '@oxide/ui'
import { GiB, KiB } from '@oxide/util'

import {
  DescriptionField,
  NameField,
  RadioField,
  SideModalForm,
  TextField,
} from 'app/components/form'
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
  num: number
  children: React.ReactNode
  complete: boolean
  running: boolean
}

function Step({ num, children, complete, running }: StepProps) {
  const status = complete ? 'complete' : running ? 'running' : 'ready'
  return (
    <div className="flex items-center">
      <div
        className={cn(
          'mr-6 flex h-10 w-10 items-center justify-center rounded-full border text-sans-semi-lg',
          {
            'text-disabled border-default': status === 'ready',
            'text-accent border-accent': status === 'running',
            'text-quaternary bg-raise-hover': status === 'complete',
          }
        )}
      >
        {status === 'complete' ? <Checkmark12Icon className="h-4 w-4" /> : num}
      </div>
      <div
        className={cn('text-sans-lg', {
          'text-secondary': status === 'ready',
          'text-accent': status === 'running',
          'text-default': status === 'complete',
        })}
      >
        {children}
      </div>
    </div>
  )
}

// TODO: better random placeholder disk and snapshot names, probably
const randInt = () => Math.floor(Math.random() * 100000000)

// TODO: diagram out all the possible states of this component. the complexity
// is out of hand

export function CreateImageSideModalForm() {
  const [page, setPage] = useState<'form' | 'runner'>('form')
  const navigate = useNavigate()
  const { project } = useProjectSelector()

  // TODO: this obviously needs to be a state machine
  const [uploadRunning, setUploadRunning] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // done with everything, ready to close the modal
  const [allDone, setAllDone] = useState(false)

  const onDismiss = () => navigate(pb.projectImages({ project }))

  const queryClient = useApiQueryClient()
  const createDisk = useApiMutation('diskCreate')
  const startImport = useApiMutation('diskBulkWriteImportStart')
  const uploadChunk = useApiMutation('diskBulkWriteImport')
  const stopImport = useApiMutation('diskBulkWriteImportStop')
  const finalizeDisk = useApiMutation('diskFinalizeImport')
  const createImage = useApiMutation('imageCreate')

  const abortController = useMemo(() => new AbortController(), [])

  function cancelEverything() {
    abortController.abort()
  }

  // we need these for cleanup
  const deleteDisk = useApiMutation('diskDelete')
  const deleteSnapshot = useApiMutation('snapshotDelete')

  const allMutations = [
    createDisk,
    startImport,
    uploadChunk,
    stopImport,
    finalizeDisk,
    createImage,
    deleteDisk,
    deleteSnapshot,
  ]

  const loading = allMutations.some((m) => m.isLoading)
  // TODO: showing the errors from here in the form is a terrible idea. "disk
  // name already taken" is a ridiculous error message when you don't even know
  // a disk is involved
  const submitError = allMutations.find((m) => m.error)?.error || null

  // the created snapshot and disk. presence used in cleanup to decide whether we need to
  // attempt to delete them
  const snapshot = useRef<Snapshot | null>(null)
  const disk = useRef<Disk | null>(null)

  /** If a snapshot or disk was created, clean it up*/
  async function cleanup() {
    if (snapshot.current) {
      await deleteSnapshot.mutateAsync({ path: { snapshot: snapshot.current.id } })
    }

    if (disk.current) {
      // we won't be able to delete the disk unless it's out of import mode
      const path = { disk: disk.current.id }
      const freshDisk = await queryClient.fetchQuery('diskView', { path })
      const diskState = freshDisk.state.state
      if (diskState === 'importing_from_bulk_writes') {
        await stopImport.mutateAsync({ path })
        await finalizeDisk.mutateAsync({ path, body: {} })
      }
      if (diskState === 'import_ready') {
        await finalizeDisk.mutateAsync({ path, body: {} })
      }
      await deleteDisk.mutateAsync({ path: { disk: disk.current.id } })
    }
  }

  async function onSubmit({
    imageName,
    imageDescription,
    imageFile,
    blockSize,
    os,
    version,
  }: FormValues) {
    invariant(imageFile)

    // check whether the image name is taken _before_ we do all the heavy stuff
    try {
      const image = await queryClient.fetchQuery('imageView', {
        path: { image: imageName },
        query: { project },
      })
      // TODO: set form-level error, or even better, error on the name field
      if (image) throw Error('Image name is taken')
    } catch (e) {
      // eat the error, this 404ing is good
      // TODO: still abort if the error is something other than 404
    }

    setPage('runner')

    // TODO: is there a smarter way to get these requests to sequence
    // without nested onSuccess callback hell?

    // Create a disk in state import-ready
    const diskName = `tmp-disk-${randInt()}`
    disk.current = await createDisk.mutateAsync({
      query: { project },
      body: {
        name: diskName,
        description: 'tmp disk used for importing image',
        diskSource: { type: 'importing_blocks', blockSize },
        size: Math.ceil(imageFile.size / GiB) * GiB,
      },
    })

    // set disk to state importing-via-bulk-write
    const path = { disk: disk.current.id }
    await startImport.mutateAsync({ path })

    // Post file to the API in chunks of size `maxChunkSize`. Browsers cap
    // concurrent fetches at 6 per host. If we ran without a concurrency limit,
    // we'd read way more chunks into memory than we're ready to POST, and we'd
    // be sitting around waiting for the browser to let the fetches through.
    // That sounds bad. So we use pMap to process at most 6 chunks at a time.

    setUploadRunning(true)

    // base64 encoding increases the size of the data by around 33%, so we
    // need to offset that to end up with a chunk size under maxChunkSize
    // TODO: is that correct and is there wiggle room, i.e., do we need to go
    // lower than 3/4 to be safe
    const maxChunkSize = 512 * KiB
    const adjChunkSize = Math.floor((maxChunkSize * 3) / 4)
    const nChunks = Math.ceil(imageFile.size / adjChunkSize)

    // TODO: try to warn user if they try to close the tab while this is going

    let chunksProcessed = 0
    setUploadProgress(0)

    const postChunk = async (i: number) => {
      const offset = i * adjChunkSize
      const end = Math.min(offset + adjChunkSize, imageFile.size)
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

    // TODO: handle user cancelation with abort signal
    await pMap(
      new Array(nChunks).fill(null),
      (_, i) => pRetry(() => postChunk(i), { retries: 2 }),
      // browser can only do 6 fetches at once, so we only read 6 chunks at once
      { concurrency: 6, signal: abortController.signal }
    )

    setUploadRunning(false)
    setUploadComplete(true)

    await stopImport.mutateAsync({ path })
    const snapshotName = `tmp-snapshot-${randInt()}`
    await finalizeDisk.mutateAsync({ path, body: { snapshotName } })

    // diskFinalizeImport does not return the snapshot, but create image
    // requires an ID
    snapshot.current = await queryClient.fetchQuery('snapshotView', {
      path: { snapshot: snapshotName },
      query: { project },
    })

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

    queryClient.invalidateQueries('imageList')

    // now delete the snapshot and the disk
    await cleanup()

    setAllDone(true)
  }

  return (
    <SideModalForm
      id="upload-image-form"
      formOptions={{ defaultValues }}
      title="Upload image"
      onDismiss={onDismiss}
      onSubmit={async (values) => {
        if (allDone) onDismiss()

        try {
          await onSubmit(values)
        } catch (e) {
          console.log(e)
          cancelEverything()
          setUploadRunning(false)
          await cleanup()
          // TODO: if we get here, show the failure state on the form
        }
      }}
      loading={loading}
      submitError={submitError}
      submitLabel={allDone ? 'Done' : 'Upload image'}
    >
      {({ control, watch }) => {
        const file = watch('imageFile')
        return (
          <>
            <Wrap when={page !== 'form'} with={<div className="hidden" />}>
              <NameField name="imageName" label="Name" control={control} />
              <DescriptionField
                name="imageDescription"
                label="Description"
                control={control}
              />
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
                render={({ field: { value: _value, onChange, ...rest } }) => (
                  <>
                    <FieldLabel id="image-file-input-label" htmlFor="image-file-input">
                      Image file
                    </FieldLabel>
                    <input
                      id="image-file-input"
                      {...rest}
                      type="file"
                      onChange={(e) => {
                        if (e.target.files) {
                          onChange(e.target.files[0])
                        }
                      }}
                    />
                  </>
                )}
              />
            </Wrap>
            {file && page === 'runner' && (
              <div className="space-y-4">
                <Step
                  num={1}
                  running={createDisk.isLoading}
                  complete={createDisk.isSuccess}
                >
                  Create temporary disk
                </Step>
                <Step
                  num={2}
                  running={startImport.isLoading}
                  complete={startImport.isSuccess}
                >
                  Set disk to import mode
                </Step>
                <Step num={3} running={uploadRunning} complete={uploadComplete}>
                  Upload file
                </Step>
                <div className="rounded-lg border p-4 border-secondary">
                  <div className="flex justify-between">
                    <div className="text-sans-md">{file.name}</div>
                    {/* <button onClick={cancelEverything}>
                        <Close12Icon aria-label="Cancel" className="text-accent" />
                      </button> */}
                  </div>
                  <div className="mt-1.5">
                    <div className="flex justify-between text-mono-sm">
                      <div className="!normal-case text-quaternary">
                        {filesize((uploadProgress / 100) * file.size, {
                          base: 2,
                          pad: true,
                        })}{' '}
                        / {filesize(file.size, { base: 2, pad: true })}
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
                <Step
                  num={4}
                  running={stopImport.isLoading}
                  complete={stopImport.isSuccess}
                >
                  Get disk out of import mode
                </Step>
                <Step
                  num={5}
                  running={finalizeDisk.isLoading}
                  complete={finalizeDisk.isSuccess}
                >
                  Finalize disk and create snapshot
                </Step>
                <Step
                  num={6}
                  running={createImage.isLoading}
                  complete={createImage.isSuccess}
                >
                  Create image
                </Step>
                <Step
                  num={7}
                  // TODO: this probably flashes not loading between the two requests
                  running={deleteDisk.isLoading || deleteSnapshot.isLoading}
                  complete={deleteDisk.isSuccess || deleteSnapshot.isSuccess}
                >
                  Delete disk and snapshot
                </Step>
                {allDone && (
                  <div className="flex justify-center rounded-lg border p-4 text-accent bg-accent-secondary border-secondary">
                    Image created! Press done to close this modal.
                  </div>
                )}
              </div>
            )}
          </>
        )
      }}
    </SideModalForm>
  )
}
