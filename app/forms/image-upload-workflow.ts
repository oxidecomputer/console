/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Context, Data, Effect, Layer, Schedule, type Duration } from 'effect'
import type { Dispatch, SetStateAction } from 'react'

import {
  api,
  queryClient,
  type ApiError,
  type ApiResult,
  type BlockSize,
  type Disk,
  type DiskCreate,
  type FinalizeDisk,
  type Image,
  type ImageCreate,
  type ImportBlocksBulkWrite,
  type Snapshot,
} from '@oxide/api'

import { processServerError } from '~/api/errors'
import { readBlobAsBase64 } from '~/util/file'
import { isAllZeros } from '~/util/str'
import { GiB, KiB } from '~/util/units'

/**
 * Translate a generated API call's `Promise<ApiResult<T>>` into an
 * `Effect<T, ApiError | ApiTransportError>`. The generated client's contract is
 * that API failures live in the resolved value (`{ type: 'error', ... }`).
 * Promise rejections are transport failures: fetch rejected before the API
 * could answer, so keep them distinct from API errors in the typed channel.
 */
const unwrap = <T>(method: string, fn: (signal: AbortSignal) => Promise<ApiResult<T>>) =>
  Effect.tryPromise({
    try: fn,
    catch: (error) => new ApiTransportError({ method, error }),
  }).pipe(
    Effect.flatMap((r) =>
      r.type === 'success'
        ? Effect.succeed(r.data)
        : Effect.fail(processServerError(method, r))
    )
  )

/**
 * Workflow-level failure: the precheck found that the requested image name is
 * already in use. Tagged so the component can dispatch it to the form-level
 * error slot instead of the upload-modal error slot.
 */
export class ImageNameTaken extends Data.TaggedError('ImageNameTaken') {}

export class ApiTransportError extends Data.TaggedError('ApiTransportError')<{
  readonly method: string
  readonly error: unknown
}> {}

type ApiFailure = ApiError | ApiTransportError
type ApiEffect<A> = Effect.Effect<A, ApiFailure>

export class ChunkUploadTimedOut extends Data.TaggedError('ChunkUploadTimedOut')<{
  readonly index: number
  readonly offset: number
}> {}

type ChunkUploadFailure = ApiFailure | ChunkUploadTimedOut
export type UploadFailure = ChunkUploadFailure | ImageNameTaken

export class DiskApi extends Context.Tag('ImageUpload/DiskApi')<
  DiskApi,
  {
    create: (body: DiskCreate) => ApiEffect<Disk>
    view: (disk: string) => ApiEffect<Disk>
    delete: (disk: string) => ApiEffect<void>
    bulkWriteStart: (disk: string) => ApiEffect<void>
    bulkWriteStop: (disk: string) => ApiEffect<void>
    bulkWrite: (disk: string, body: ImportBlocksBulkWrite) => ApiEffect<void>
    finalize: (disk: string, body: FinalizeDisk) => ApiEffect<void>
  }
>() {}

export class ImageApi extends Context.Tag('ImageUpload/ImageApi')<
  ImageApi,
  {
    create: (body: ImageCreate) => ApiEffect<Image>
    /**
     * True if an image with this name already exists in the project, false
     * if a 404 came back. Other API errors stay in the error channel.
     */
    nameExists: (name: string) => ApiEffect<boolean>
  }
>() {}

export class SnapshotApi extends Context.Tag('ImageUpload/SnapshotApi')<
  SnapshotApi,
  {
    view: (snapshot: string) => ApiEffect<Snapshot>
    delete: (snapshot: string) => ApiEffect<void>
  }
>() {}

export class UploadNames extends Context.Tag('ImageUpload/UploadNames')<
  UploadNames,
  {
    temporaryDisk: (imageName: string) => Effect.Effect<string>
    temporarySnapshot: Effect.Effect<string>
  }
>() {}

export class UploadPolicy extends Context.Tag('ImageUpload/UploadPolicy')<
  UploadPolicy,
  {
    chunkTimeout: Duration.DurationInput
    chunkRetryPolicy: Schedule.Schedule<unknown, ChunkUploadFailure>
  }
>() {}

type LayerArgs = { project: string }

const invalidate = (key: 'diskList' | 'imageList' | 'snapshotList') =>
  Effect.sync(() => queryClient.invalidateEndpoint(key))

export const liveDiskApi = ({ project }: LayerArgs) =>
  Layer.succeed(DiskApi, {
    create: (body) =>
      unwrap('diskCreate', (signal) =>
        api.diskCreate({ query: { project }, body }, { signal })
      ),
    view: (disk) =>
      unwrap('diskView', (signal) => api.diskView({ path: { disk } }, { signal })),
    delete: (disk) =>
      unwrap('diskDelete', (signal) => api.diskDelete({ path: { disk } }, { signal })).pipe(
        Effect.tap(() => invalidate('diskList'))
      ),
    bulkWriteStart: (disk) =>
      unwrap('diskBulkWriteImportStart', (signal) =>
        api.diskBulkWriteImportStart({ path: { disk } }, { signal })
      ),
    bulkWriteStop: (disk) =>
      unwrap('diskBulkWriteImportStop', (signal) =>
        api.diskBulkWriteImportStop({ path: { disk } }, { signal })
      ),
    bulkWrite: (disk, body) =>
      unwrap('diskBulkWriteImport', (signal) =>
        api.diskBulkWriteImport({ path: { disk }, body }, { signal })
      ),
    finalize: (disk, body) =>
      unwrap('diskFinalizeImport', (signal) =>
        api.diskFinalizeImport({ path: { disk }, body }, { signal })
      ),
  })

export const liveImageApi = ({ project }: LayerArgs) =>
  Layer.succeed(ImageApi, {
    create: (body) =>
      unwrap('imageCreate', (signal) =>
        api.imageCreate({ query: { project }, body }, { signal })
      ).pipe(Effect.tap(() => invalidate('imageList'))),
    nameExists: (name) =>
      // Resolve directly off the ApiResult tag so the 404-as-boolean fold
      // never goes through the failure channel (and never logs through
      // processServerError). E channel ends up exactly `ApiError` for every
      // other status.
      Effect.tryPromise({
        try: (signal) =>
          api.imageView({ path: { image: name }, query: { project } }, { signal }),
        catch: (error) => new ApiTransportError({ method: 'imageView', error }),
      }).pipe(
        Effect.flatMap((r) => {
          if (r.type === 'success') return Effect.succeed(true)
          if (r.response.status === 404) return Effect.succeed(false)
          return Effect.fail(processServerError('imageView', r))
        })
      ),
  })

export const liveSnapshotApi = ({ project }: LayerArgs) =>
  Layer.succeed(SnapshotApi, {
    view: (snapshot) =>
      unwrap('snapshotView', (signal) =>
        api.snapshotView({ path: { snapshot }, query: { project } }, { signal })
      ),
    delete: (snapshot) =>
      unwrap('snapshotDelete', (signal) =>
        api.snapshotDelete({ path: { snapshot }, query: { project } }, { signal })
      ).pipe(Effect.tap(() => invalidate('snapshotList'))),
  })

/**
 * Each step shown in the upload progress modal.
 */
export type StepName =
  | 'createDisk'
  | 'importStart'
  | 'upload'
  | 'importStop'
  | 'finalize'
  | 'createImage'
  | 'cleanup'

export type StepState = 'running' | 'success' | 'error'

export type StepStateMap = Partial<Record<StepName, StepState>>

/**
 * Reports per-step status to whoever provides the layer. Production wiring
 * pushes into React state; tests can capture the sequence in an array.
 */
export class StepStatus extends Context.Tag('ImageUpload/StepStatus')<
  StepStatus,
  { set: (name: StepName, state: StepState) => Effect.Effect<void> }
>() {}

/**
 * Reports upload progress (0–100) to whoever provides the layer.
 */
export class ProgressReporter extends Context.Tag('ImageUpload/ProgressReporter')<
  ProgressReporter,
  { set: (percent: number) => Effect.Effect<void> }
>() {}

/**
 * Mark a step running before `eff`, success after, error on typed failure.
 * Interrupts intentionally leave the status untouched — the caller resets the
 * UI on the next attempt.
 */
export const withStatus = <A, E, R>(
  name: StepName,
  eff: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R | StepStatus> =>
  Effect.gen(function* () {
    const steps = yield* StepStatus
    yield* steps.set(name, 'running')
    return yield* eff.pipe(
      Effect.tapError(() => steps.set(name, 'error')),
      Effect.tap(() => steps.set(name, 'success'))
    )
  })

export const liveStepStatus = (setStepStates: Dispatch<SetStateAction<StepStateMap>>) =>
  Layer.succeed(StepStatus, {
    set: (name, state) =>
      Effect.sync(() => setStepStates((prev) => ({ ...prev, [name]: state }))),
  })

export const liveProgressReporter = (setProgress: (percent: number) => void) =>
  Layer.succeed(ProgressReporter, {
    set: (percent) => Effect.sync(() => setProgress(percent)),
  })

const randInt = () => Math.floor(Math.random() * 100000000)

function getTmpDiskName(imageName: string) {
  if (process.env.NODE_ENV === 'development') {
    // MSW uses these names as user-controlled sentinels in e2e tests. Keeping
    // the branch in the live layer keeps the workflow itself deterministic when
    // tests provide a different UploadNames service.
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

export const liveUploadNames = Layer.succeed(UploadNames, {
  temporaryDisk: (imageName) => Effect.sync(() => getTmpDiskName(imageName)),
  temporarySnapshot: Effect.sync(() => `tmp-snapshot-${randInt()}`),
})

export const liveUploadPolicy = Layer.succeed(UploadPolicy, {
  chunkTimeout: '30 seconds',
  chunkRetryPolicy: Schedule.recurs(2),
})

/**
 * Crucible currently enforces a limit of 512 KiB. See [crucible
 * source](https://github.com/oxidecomputer/crucible/blob/c574ff1232/pantry/src/pantry.rs#L239-L253).
 */
const CHUNK_SIZE_BYTES = 512 * KiB

export type UploadInput = {
  imageName: string
  imageDescription: string
  imageFile: File
  blockSize: BlockSize
  os: string
  version: string
}

/**
 * The upload Effect. Creates a temp disk under a scoped finalizer (so cleanup
 * runs on success, failure, and interrupt), uploads the file in chunks, then
 * finalizes into a snapshot and creates the image. Requires DiskApi, ImageApi,
 * SnapshotApi, UploadNames, UploadPolicy, StepStatus, and ProgressReporter —
 * supplied as Layers so the workflow itself stays pure.
 */
export const uploadFlow = ({
  imageName,
  imageDescription,
  imageFile,
  blockSize,
  os,
  version,
}: UploadInput) =>
  Effect.scoped(
    Effect.gen(function* () {
      const diskApi = yield* DiskApi
      const imageApi = yield* ImageApi
      const snapshotApi = yield* SnapshotApi
      const uploadNames = yield* UploadNames
      const uploadPolicy = yield* UploadPolicy
      const steps = yield* StepStatus
      const progress = yield* ProgressReporter
      const temporaryDiskName = yield* uploadNames.temporaryDisk(imageName)

      // Acquire the temp disk under a scoped finalizer. The release runs on
      // success, failure, and interrupt — replacing the imperative cleanup()
      // and the snapshot/disk refs that tracked which were live. State-aware
      // shutdown lives next to the acquire, where it belongs. The release
      // also drives the "Delete disk and snapshot" UI step; the snapshot
      // release runs first but is silent.
      const created = yield* Effect.acquireRelease(
        withStatus(
          'createDisk',
          diskApi.create({
            name: temporaryDiskName,
            description: `temporary disk for importing image ${imageName}`,
            diskBackend: {
              type: 'distributed',
              diskSource: { type: 'importing_blocks', blockSize },
            },
            size: Math.ceil(imageFile.size / GiB) * GiB,
          })
        ),
        (d) =>
          Effect.gen(function* () {
            yield* steps.set('cleanup', 'running')
            const fresh = yield* diskApi.view(d.id)
            const state = fresh.state.state
            if (state === 'importing_from_bulk_writes') {
              yield* diskApi.bulkWriteStop(d.id)
              yield* diskApi.finalize(d.id, {})
            } else if (state === 'import_ready') {
              yield* diskApi.finalize(d.id, {})
            }
            yield* diskApi.delete(d.id)
            yield* steps.set('cleanup', 'success')
          }).pipe(Effect.orDie)
      )

      // Import mode is a scoped resource. acquireUseRelease guarantees
      // bulkWriteStop runs after the upload regardless of how it exits —
      // including interrupt — so the disk reaches `import_ready` without the
      // disk-cleanup branch having to detect-and-recover from
      // `importing_from_bulk_writes`. The status calls here drive the existing
      // import-start / import-stop step icons.
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
            yield* diskApi.bulkWrite(created.id, { offset, base64EncodedData }).pipe(
              Effect.timeoutFail({
                duration: uploadPolicy.chunkTimeout,
                onTimeout: () => new ChunkUploadTimedOut({ index: i, offset }),
              }),
              Effect.retry(uploadPolicy.chunkRetryPolicy)
            )
          }
          chunksProcessed++
          yield* progress.set(Math.round((100 * chunksProcessed) / nChunks))
        })

      // avoid pointless array of size 4000 for a 2gb image
      function* genChunks() {
        for (let i = 0; i < nChunks; i++) yield i
      }

      // Browsers cap concurrent fetches at 6 per host, so concurrency 6 keeps
      // us from reading more into memory than we can POST.
      yield* Effect.acquireUseRelease(
        withStatus('importStart', diskApi.bulkWriteStart(created.id)),
        () =>
          withStatus('upload', Effect.forEach(genChunks(), postChunk, { concurrency: 6 })),
        () => withStatus('importStop', diskApi.bulkWriteStop(created.id)).pipe(Effect.orDie)
      )

      const snapshotName = yield* uploadNames.temporarySnapshot

      // The snapshot is created by diskFinalizeImport. Bracketing finalize
      // (rather than the subsequent view) guarantees that as soon as the
      // snapshot exists server-side, its delete finalizer is registered —
      // even if the view fails. snapshotName is a NameOrId, so the delete
      // works without resolving the ID first.
      const createdSnapshot = yield* withStatus(
        'finalize',
        Effect.gen(function* () {
          yield* Effect.acquireRelease(diskApi.finalize(created.id, { snapshotName }), () =>
            snapshotApi.delete(snapshotName).pipe(Effect.orDie)
          )
          return yield* snapshotApi.view(snapshotName)
        })
      )

      // TODO: we checked at the beginning that the image name was free, but it
      // could be taken during upload. If this fails with object already exists,
      // don't delete the snapshot (could still delete the disk). Instead, link
      // user to snapshot detail and tell them to go there and create the image
      // from it.
      yield* withStatus(
        'createImage',
        imageApi.create({
          name: imageName,
          description: imageDescription,
          os,
          version,
          source: { type: 'snapshot', id: createdSnapshot.id },
        })
      )

      // Scope closes here. Finalizers run in reverse acquisition order:
      // snapshot delete, then state-aware disk cleanup + delete.
    })
  )

/**
 * Whole-submit Effect: precheck the image name, then (if free) run
 * `onPrecheckPassed` (component uses it to reset UI state and open the
 * progress modal) and run the upload. One fiber covers both phases so
 * cancellation, error handling, and finalizers go through one Exit. The
 * callback fires inside the fiber so a failed precheck never opens the modal.
 */
export const submitProgram = (values: UploadInput, onPrecheckPassed: () => void) =>
  Effect.gen(function* () {
    const imageApi = yield* ImageApi
    const taken = yield* imageApi.nameExists(values.imageName)
    if (taken) yield* new ImageNameTaken()

    // The reset has to happen here (not before runFork) because outstanding
    // bulk writes from a canceled previous run can still arrive and bump
    // uploadProgress.
    yield* Effect.sync(onPrecheckPassed)

    yield* uploadFlow(values)
  })
