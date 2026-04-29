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
 * `Effect<T, ApiError>`. The runtime throws the processed error on failure
 * and the surrounding `Effect.tryPromise` catches it.
 */
const unwrap = <T>(method: string, p: Promise<ApiResult<T>>) =>
  Effect.tryPromise({
    try: () =>
      p.then((r) => {
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

type LayerArgs = {
  project: string
  // closure so layer methods read the current signal at call time, not at
  // layer construction. each upload attempt swaps in a fresh AbortController
  // without rebuilding the layer.
  getSignal: () => AbortSignal | undefined
}

const invalidate = (key: 'diskList' | 'imageList' | 'snapshotList') =>
  Effect.sync(() => queryClient.invalidateEndpoint(key))

export const liveDiskApi = ({ project, getSignal }: LayerArgs) =>
  Layer.succeed(DiskApi, {
    create: (body) =>
      unwrap(
        'diskCreate',
        api.diskCreate({ query: { project }, body }, { signal: getSignal() })
      ),
    view: (disk) =>
      Effect.tryPromise({
        try: () => queryClient.fetchQuery(q(api.diskView, { path: { disk } })),
        catch: (e) => e as ApiError,
      }),
    delete: (disk) =>
      unwrap(
        'diskDelete',
        api.diskDelete({ path: { disk } }, { signal: getSignal() })
      ).pipe(Effect.tap(() => invalidate('diskList'))),
    bulkWriteStart: (disk) =>
      unwrap(
        'diskBulkWriteImportStart',
        api.diskBulkWriteImportStart({ path: { disk } }, { signal: getSignal() })
      ),
    bulkWriteStop: (disk) =>
      unwrap(
        'diskBulkWriteImportStop',
        api.diskBulkWriteImportStop({ path: { disk } }, { signal: getSignal() })
      ),
    bulkWrite: (disk, body) =>
      unwrap(
        'diskBulkWriteImport',
        api.diskBulkWriteImport({ path: { disk }, body }, { signal: getSignal() })
      ),
    finalize: (disk, body) =>
      unwrap(
        'diskFinalizeImport',
        api.diskFinalizeImport({ path: { disk }, body }, { signal: getSignal() })
      ),
  })

export const liveImageApi = ({ project, getSignal }: LayerArgs) =>
  Layer.succeed(ImageApi, {
    create: (body) =>
      unwrap(
        'imageCreate',
        api.imageCreate({ query: { project }, body }, { signal: getSignal() })
      ).pipe(Effect.tap(() => invalidate('imageList'))),
  })

export const liveSnapshotApi = ({ project, getSignal }: LayerArgs) =>
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
      unwrap(
        'snapshotDelete',
        api.snapshotDelete({ path: { snapshot } }, { signal: getSignal() })
      ).pipe(Effect.tap(() => invalidate('snapshotList'))),
  })
