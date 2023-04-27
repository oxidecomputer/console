import filesize from 'filesize'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'

import type { BlockSize } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { FieldLabel, Progress } from '@oxide/ui'
import { GiB, KiB, runConcurrent } from '@oxide/util'

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

// TODO: better random placeholder disk and snapshot names, probably
const randInt = () => Math.floor(Math.random() * 100000000)

export function CreateImageSideModalForm() {
  const navigate = useNavigate()
  const { project } = useProjectSelector()

  const [showProgress, setShowProgress] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDismiss = () => navigate(pb.projectImages({ project }))

  const queryClient = useApiQueryClient()
  const createDisk = useApiMutation('diskCreate')
  const startImport = useApiMutation('diskBulkWriteImportStart')
  const uploadChunk = useApiMutation('diskBulkWriteImport')
  const stopImport = useApiMutation('diskBulkWriteImportStop')
  const finalizeDisk = useApiMutation('diskFinalizeImport')
  const createImage = useApiMutation('imageCreate')

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

  async function onSubmit({
    imageName,
    imageDescription,
    imageFile,
    blockSize,
    os,
    version,
  }: FormValues) {
    invariant(imageFile)

    // TODO: make sure the image name is not taken _before_ we do all this

    // TODO: handle case where image name is taken during upload — hold onto
    // disk and give opportunity to chose another name. Or just do upload
    // first and ask for image name at the end? That seems weird.

    // TODO: is there a smarter way to get these requests to sequence
    // without nested onSuccess callback hell?

    // Create a disk in state import-ready
    const diskName = `tmp-disk-${randInt()}`
    const disk = await createDisk.mutateAsync({
      query: { project },
      body: {
        name: diskName,
        description: 'tmp disk used for importing image',
        diskSource: { type: 'importing_blocks', blockSize },
        size: Math.ceil(imageFile.size / GiB) * GiB,
      },
    })

    // set disk to state importing-via-bulk-write
    const path = { disk: disk.id }
    await startImport.mutateAsync({ path })

    // Post file chunks to the API

    const maxChunkSize = 512 * KiB
    /**
     * base64 encoding increases the size of the data by around 33%, so we
     * need to offset that to end up with a chunk size under maxChunkSize
     */
    // TODO: is that correct and is there wiggle room, i.e., do we need to go
    // lower than 3/4 to be safe
    const adjChunkSize = Math.floor((maxChunkSize * 3) / 4)
    const nChunks = Math.ceil(imageFile.size / adjChunkSize)

    let chunksProcessed = 0
    setUploadProgress(0)
    setShowProgress(true)

    // TODO: try to warn user if they try to close the tab

    /**
     * Process a file in chunks of size `maxChunkSize`. Without the
     * generator aspect, this would be pretty straightforward, so first
     * start by thinking of it that way. To process a file in chunks, loop
     * through offsets that are chunkSize apart. For each one, read the
     * contents of that slice and call `processChunk` on it. (`processChunk`
     * makes a fetch, which is relevant.)
     *
     * The annoying part here is that we do not want to eagerly kick off all
     * these functions in parallel because reading the file slice is a lot
     * faster than `processChunk` (because browsers cap the number of
     * concurrent requests to ~6), so if we run all the functions in
     * parallel, we could read way more chunks into memory than we're ready
     * to actually POST. That sounds bad. So instead of actually _doing_ the
     * thing for each chunk in the loop, we yield a function that does the
     * thing, and use `runConcurrent` to run at most 6 functions at a time.
     */
    // TODO: ability to abort this whole thing
    // TODO: handle errors
    const genUploadChunkTasks = async function* () {
      for (let i = 0; i < nChunks; i++) {
        // important to do this inside the loop instead of mutating `start`
        // outside it to avoid closing over a value that changes under you
        const offset = i * adjChunkSize
        const end = Math.min(offset + adjChunkSize, imageFile.size)
        yield async (): Promise<void> => {
          const base64EncodedData = await readBlobAsBase64(imageFile.slice(offset, end))
          await uploadChunk.mutateAsync({ path, body: { offset, base64EncodedData } })
          chunksProcessed++
          setUploadProgress(Math.round((100 * chunksProcessed) / nChunks))
        }
      }
    }

    // browser can only do 6 fetches at once, so we only read 6 chunks at once
    await runConcurrent(genUploadChunkTasks(), 6)

    await stopImport.mutateAsync({ path })
    const snapshotName = `tmp-snapshot-${randInt()}`
    await finalizeDisk.mutateAsync({ path, body: { snapshotName } })

    // diskFinalizeImport does not return the snapshot, but create image
    // requires an ID
    const snapshot = await queryClient.fetchQuery('snapshotView', {
      path: { snapshot: snapshotName },
      query: { project },
    })
    await createImage.mutateAsync({
      query: { project },
      body: {
        name: imageName,
        description: imageDescription,
        blockSize,
        os,
        version,
        source: { type: 'snapshot', id: snapshot.id },
      },
    })

    // now delete the snapshot and the disk
    await deleteSnapshot.mutateAsync({ path: { snapshot: snapshot.id } })
    await deleteDisk.mutateAsync({ path: { disk: disk.id } })

    queryClient.invalidateQueries('imageList')
    onDismiss()
  }

  return (
    <SideModalForm
      id="upload-image-form"
      formOptions={{ defaultValues }}
      title="Upload image"
      onDismiss={onDismiss}
      onSubmit={(values) => {
        try {
          onSubmit(values)
        } catch (e) {
          console.log(e)
        }
      }}
      loading={loading}
      submitError={submitError}
    >
      {({ control }) => (
        <>
          <NameField name="imageName" label="Name" control={control} />
          <DescriptionField name="imageDescription" label="Description" control={control} />
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
            render={({ field: { value: file, onChange, ...rest } }) => (
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
                {file && showProgress && (
                  <div className="rounded-lg border p-4 border-secondary">
                    <div className="text-sans-md">{file.name}</div>
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
                )}
              </>
            )}
          />
        </>
      )}
    </SideModalForm>
  )
}
