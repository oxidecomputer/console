import filesize from 'filesize'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'

import type { ApiError, ClientError } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Progress } from '@oxide/ui'
import { GiB, KiB, runConcurrent } from '@oxide/util'

import { NameField, SideModalForm } from 'app/components/form'
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
  name: string
  file: File | null
}

const defaultValues: FormValues = {
  name: '',
  file: null,
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

  const allMutations = [
    createDisk,
    startImport,
    uploadChunk,
    stopImport,
    finalizeDisk,
    createImage,
  ]

  return (
    <SideModalForm
      id="upload-image-form"
      formOptions={{ defaultValues }}
      title="Upload image"
      onDismiss={onDismiss}
      onSubmit={async ({ file, name: imageName }) => {
        invariant(file)

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
            diskSource: {
              type: 'importing_blocks',
              blockSize: 512, // TODO: should this be something else?
            },
            size: Math.ceil(file.size / GiB) * GiB,
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
        const nChunks = Math.ceil(file.size / adjChunkSize)

        let chunksProcessed = 0
        setUploadProgress(0)
        setShowProgress(true)

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
            const end = Math.min(offset + adjChunkSize, file.size)
            yield async (): Promise<void> => {
              const base64EncodedData = await readBlobAsBase64(file.slice(offset, end))
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
        const snapshot = await queryClient.fetchQuery('snapshotView', {
          path: { snapshot: snapshotName },
          query: { project },
        })
        await createImage.mutateAsync({
          query: { project },
          body: {
            blockSize: 512,
            description: '',
            name: imageName,
            os: 'Ubuntu',
            version: '1.0.0',
            source: { type: 'snapshot', id: snapshot.id },
          },
        })

        queryClient.invalidateQueries('imageList')
        onDismiss()
      }}
      loading={allMutations.some((m) => m.isLoading)}
      // TODO: figure out why this type doesn't work without help
      submitError={
        (allMutations.find((m) => m.error) as unknown as ApiError | ClientError) || null
      }
    >
      {({ control }) => (
        <>
          <NameField name="name" control={control} />
          <Controller
            name="file"
            control={control}
            render={({ field: { value: file, onChange, ...rest } }) => (
              <>
                <input
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
