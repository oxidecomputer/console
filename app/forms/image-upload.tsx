import { Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'

import type { ApiError, ClientError } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { GiB, KiB } from '@oxide/util'

import { NameField, SideModalForm } from 'app/components/form'
import { useProjectSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

async function processFile(
  file: File,
  maxChunkSize: number,
  processChunk: (offset: number, chunk: string) => Promise<void>
): Promise<void> {
  /**
   * base64 encoding increases the size of the data by around 33%, so we need to
   * offset that to end up with a chunk size under maxChunkSize
   */
  // TODO: is that correct and is there wiggle room, i.e., do we need to go
  // lower than 3/4 to be safe
  const adjChunkSize = Math.floor((maxChunkSize * 3) / 4)
  const fileSize = file.size
  let start = 0

  return new Promise(function (resolve) {
    function readNextChunk() {
      if (start >= fileSize) {
        resolve()
        return
      }

      const end = Math.min(start + adjChunkSize, fileSize)
      const fileReader = new FileReader()

      fileReader.onload = async function (e) {
        const result = e.target?.result
        if (typeof result === 'string') {
          const base64Chunk = result.split(',').pop()!
          await processChunk(start, base64Chunk)
        }
        start = end
        readNextChunk()
      }

      fileReader.readAsDataURL(file.slice(start, end))
    }

    readNextChunk()
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
            size: 5 * GiB, // TODO: get file size and round up to the nearest GiB
          },
        })

        // set disk to state importing-via-bulk-write
        const path = { disk: disk.id }
        await startImport.mutateAsync({ path })

        // Post file chunks to the API
        // TODO: in parallel, hello
        // TODO: ability to abort this whole thing
        await processFile(file, 512 * KiB, async (offset, base64EncodedData) => {
          console.log('chunk:', { offset, length: base64EncodedData.length })
          await uploadChunk.mutateAsync({ path, body: { offset, base64EncodedData } })
        })
        // TODO: track upload progress in state and display it

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
        </>
      )}
    </SideModalForm>
  )
}
