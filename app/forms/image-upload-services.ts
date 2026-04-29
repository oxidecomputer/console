/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Context, Data, Effect, Layer } from 'effect'
import type { Dispatch, SetStateAction } from 'react'

import {
  api,
  q,
  queryClient,
  type ApiError,
  type ApiResult,
  type Disk,
  type DiskCreate,
  type FinalizeDisk,
  type Image,
  type ImageCreate,
  type ImportBlocksBulkWrite,
  type Snapshot,
} from '@oxide/api'

import { processServerError } from '~/api/errors'

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
