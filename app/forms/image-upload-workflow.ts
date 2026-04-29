/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Context, Data, Effect, Layer, Schedule } from 'effect'
import type { Dispatch, SetStateAction } from 'react'

import {
  api,
  q,
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
 * `Effect<T, ApiError>`. The fiber's interrupt-driven `AbortSignal` is forwarded
 * into the underlying fetch, so `Fiber.interrupt` aborts in-flight requests.
 */
const unwrap = <T>(method: string, fn: (signal: AbortSignal) => Promise<ApiResult<T>>) =>
  Effect.tryPromise({
    try: (signal) =>
      fn(signal).then((r) => {
        if (r.type === 'success') return r.data
        throw processServerError(method, r)
      }),
    catch: (e) => e as ApiError,
  })

export class DiskApi extends Context.Tag('ImageUpload/DiskApi')<
  DiskApi,
  {
    create: (body: DiskCreate) => Effect.Effect<Disk, ApiError>
    view: (disk: string) => Effect.Effect<Disk, ApiError>
    delete: (disk: string) => Effect.Effect<void, ApiError>
    bulkWriteStart: (disk: string) => Effect.Effect<void, ApiError>
    bulkWriteStop: (disk: string) => Effect.Effect<void, ApiError>
    bulkWrite: (disk: string, body: ImportBlocksBulkWrite) => Effect.Effect<void, ApiError>
    finalize: (disk: string, body: FinalizeDisk) => Effect.Effect<void, ApiError>
  }
>() {}

export class ImageApi extends Context.Tag('ImageUpload/ImageApi')<
  ImageApi,
  {
    create: (body: ImageCreate) => Effect.Effect<Image, ApiError>
    /**
     * True if an image with this name already exists in the project, false
     * if a 404 came back. Other API errors stay in the error channel.
     */
    nameExists: (name: string) => Effect.Effect<boolean, ApiError>
  }
>() {}

/**
 * Workflow-level failure: the precheck found that the requested image name is
 * already in use. Tagged so the component can dispatch it to the form-level
 * error slot instead of the upload-modal error slot.
 */
export class ImageNameTaken extends Data.TaggedError('ImageNameTaken') {}

export class SnapshotApi extends Context.Tag('ImageUpload/SnapshotApi')<
  SnapshotApi,
  {
    view: (snapshot: string) => Effect.Effect<Snapshot, ApiError>
    delete: (snapshot: string) => Effect.Effect<void, ApiError>
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
      Effect.tryPromise({
        try: () => queryClient.fetchQuery(q(api.diskView, { path: { disk } })),
        catch: (e) => e as ApiError,
      }),
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
      // errorsExpected lives on q() and only suppresses the console warning
      // for the expected 404; we still need to catch the 404 here to fold
      // existence into a boolean.
      Effect.tryPromise({
        try: () =>
          queryClient.fetchQuery(
            q(
              api.imageView,
              { path: { image: name }, query: { project } },
              {
                errorsExpected: {
                  explanation: 'the image name may not exist yet.',
                  statusCode: 404,
                },
              }
            )
          ),
        catch: (e) => e as ApiError,
      }).pipe(
        Effect.as(true),
        Effect.catchIf(
          (e) => e.statusCode === 404,
          () => Effect.succeed(false)
        )
      ),
  })

export const liveSnapshotApi = ({ project }: LayerArgs) =>
  Layer.succeed(SnapshotApi, {
    view: (snapshot) =>
      Effect.tryPromise({
        try: () =>
          queryClient.fetchQuery(
            q(api.snapshotView, { path: { snapshot }, query: { project } })
          ),
        catch: (e) => e as ApiError,
      }),
    delete: (snapshot) =>
      unwrap('snapshotDelete', (signal) =>
        api.snapshotDelete({ path: { snapshot } }, { signal })
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

/**
 * Crucible currently enforces a limit of 512 KiB. See [crucible
 * source](https://github.com/oxidecomputer/crucible/blob/c574ff1232/pantry/src/pantry.rs#L239-L253).
 */
const CHUNK_SIZE_BYTES = 512 * KiB

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
 * SnapshotApi, StepStatus, and ProgressReporter — supplied as Layers so the
 * workflow itself stays pure.
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
      const steps = yield* StepStatus
      const progress = yield* ProgressReporter

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
            name: getTmpDiskName(imageName),
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

      // set disk to state importing-via-bulk-write
      yield* withStatus('importStart', diskApi.bulkWriteStart(created.id))

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
          yield* progress.set(Math.round((100 * chunksProcessed) / nChunks))
        })

      // avoid pointless array of size 4000 for a 2gb image
      function* genChunks() {
        for (let i = 0; i < nChunks; i++) yield i
      }

      yield* withStatus(
        'upload',
        Effect.forEach(genChunks(), postChunk, { concurrency: 6 })
      )

      yield* withStatus('importStop', diskApi.bulkWriteStop(created.id))

      const snapshotName = `tmp-snapshot-${randInt()}`

      // diskFinalizeImport does not return the snapshot, but create image
      // requires an ID. Acquire it under a finalizer too so the temp snapshot
      // is cleaned up regardless of how this scope exits.
      const createdSnapshot = yield* withStatus(
        'finalize',
        Effect.gen(function* () {
          yield* diskApi.finalize(created.id, { snapshotName })
          return yield* Effect.acquireRelease(snapshotApi.view(snapshotName), (s) =>
            snapshotApi.delete(s.id).pipe(Effect.orDie)
          )
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
