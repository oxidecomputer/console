import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'

import type { ApiError, ClientError } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Progress } from '@oxide/ui'
import { GiB, KiB } from '@oxide/util'

import { NameField, SideModalForm } from 'app/components/form'
import { useProjectSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

// TODO: figure out how to visualize the concurrency here
async function runConcurrent(
  tasks: Generator<() => Promise<void>>,
  maxConcurrency: number
): Promise<void> {
  const counts = new Array(maxConcurrency).fill(0)

  async function processNextTask(i: number): Promise<void> {
    const task = await tasks.next()
    if (task.done) return

    await task.value()
    counts[i]++
    console.log('chunks processed by each thread', counts)

    return processNextTask(i)
  }

  const workers = new Array(maxConcurrency).fill(null).map((_, i) => processNextTask(i))
  await Promise.all(workers)
}

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

/**
 * base64 encoding increases the size of the data by around 33%, so we need to
 * offset that to end up with a chunk size under maxChunkSize
 */
function calcNChunks(fileSize: number, maxChunkSize: number) {
  const adjChunkSize = Math.floor((maxChunkSize * 3) / 4)
  const nChunks = Math.ceil(fileSize / adjChunkSize)
  return { adjChunkSize, nChunks }
}

/**
 * Process a file in chunks of size `maxChunkSize`. Without the generator
 * aspect, this would be pretty straightforward, so first start by thinking of
 * it that way. To process a file in chunks, loop through offsets that are
 * chunkSize apart. For each one, read the contents of that slice and call
 * `processChunk` on it. (`processChunk` makes a fetch, which is relevant.)
 *
 * The annoying part here is that we do not want to eagerly kick off all these
 * functions in parallel because reading the file slice is a lot faster than
 * `processChunk` because browsers cap the number of concurrent requests to ~6,
 * so if we run all the functions in parallel, we could read all the chunks into
 * memory while the fetches are all queued up by the browser. That sounds bad.
 * So instead of actually _doing_ the thing described above, we yield a function
 * that does the thing, and use a helper in the calling code to run at most 6
 * of that function at a time.
 */
function* processFileInChunks(
  file: File,
  maxChunkSize: number,
  processChunk: (offset: number, chunk: string) => Promise<void>
): Generator<() => Promise<void>, void> {
  /**
   * base64 encoding increases the size of the data by around 33%, so we need to
   * offset that to end up with a chunk size under maxChunkSize
   */
  // TODO: is that correct and is there wiggle room, i.e., do we need to go
  // lower than 3/4 to be safe
  const { adjChunkSize, nChunks } = calcNChunks(file.size, maxChunkSize)

  for (let i = 0; i < nChunks; i++) {
    // important to do this inside the loop instead of mutating `start`
    // outside it to avoid closing over a value that changes under you
    const start = i * adjChunkSize
    const end = Math.min(start + adjChunkSize, file.size)
    yield async () => {
      const chunk = await readBlobAsBase64(file.slice(start, end))
      await processChunk(start, chunk)
    }
  }
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

        // TODO: this is redundant with what's in processFileInChunks
        const maxChunkSize = 512 * KiB
        const { nChunks } = calcNChunks(file.size, maxChunkSize)

        let chunksProcessed = 0
        setUploadProgress(0)
        setShowProgress(true)

        // TODO: ability to abort this whole thing
        // TODO: handle errors
        const gen = processFileInChunks(
          file,
          maxChunkSize,
          async (offset, base64EncodedData) => {
            // console.log('chunk:', { offset, length: base64EncodedData.length })
            await uploadChunk.mutateAsync({ path, body: { offset, base64EncodedData } })
            chunksProcessed++
            setUploadProgress((100 * chunksProcessed) / nChunks)
          }
        )
        // browser can only do 6 fetches at once, so we only read 6 chunks at once
        await runConcurrent(gen, 6)

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
            render={({ field: { value: _value, onChange, ...rest } }) => (
              <input
                {...rest}
                type="file"
                onChange={(e) => {
                  if (e.target.files) {
                    onChange(e.target.files[0])
                  }
                }}
              />
            )}
          />
          {showProgress && <Progress aria-label="Upload progress" value={uploadProgress} />}
        </>
      )}
    </SideModalForm>
  )
}
