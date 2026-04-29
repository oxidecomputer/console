/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Context, Effect, Layer } from 'effect'

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
  }
>() {}

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
