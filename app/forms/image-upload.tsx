import { Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { GiB } from '@oxide/util'

import { SideModalForm } from 'app/components/form'
import { useProjectSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

type FormValues = {
  file: File | null
}

const defaultValues: FormValues = {
  file: null,
}

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

  return (
    <SideModalForm
      id="upload-image-form"
      formOptions={{ defaultValues }}
      title="Upload image"
      onDismiss={onDismiss}
      onSubmit={async ({ file }) => {
        invariant(file)

        // TODO: is there a smarter way to get these these requests to sequence
        // without nested onSuccess callback hell?

        // Create a disk in state import-ready
        const disk = await createDisk.mutateAsync({
          query: { project },
          body: {
            name: 'tmp-disk',
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

        // Post file chunks to the API in parallel
        // TODO: actually do that
        for (let i = 0; i < 10; i++) {
          await uploadChunk.mutateAsync({
            path,
            body: { offset: i, base64EncodedData: 'abc' },
          })
        }
        // TODO: track upload progress in state and display it

        await stopImport.mutateAsync({ path })
        const snapshotName = 'tmp-snapshot'
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
            name: 'ok',
            os: 'Ubuntu',
            version: '1.0.0',
            source: { type: 'snapshot', id: snapshot.id },
          },
        })
      }}
      // loading={createProject.isLoading}
      // submitError={createProject.error}
      submitError={null}
    >
      {({ control }) => (
        <>
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
