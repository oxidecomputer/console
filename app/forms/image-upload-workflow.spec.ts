/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Cause, Deferred, Effect, Exit, Fiber, Layer, type Context } from 'effect'
import { describe, expect, it, vi } from 'vitest'

import type { ApiError, Disk, Image, Snapshot } from '@oxide/api'

import {
  DiskApi,
  ImageApi,
  ImageNameTaken,
  ProgressReporter,
  SnapshotApi,
  StepStatus,
  submitProgram,
  uploadFlow,
  type StepName,
  type StepState,
  type UploadInput,
} from './image-upload-workflow'

const apiErr: ApiError = {
  statusCode: 500,
  errorCode: 'InternalError',
  message: 'boom',
} as unknown as ApiError

const stubDisk = (id: string, state: Disk['state']['state'] = 'detached'): Disk =>
  ({ id, state: { state } }) as unknown as Disk

const stubSnapshot = (id: string): Snapshot => ({ id }) as unknown as Snapshot

type Recorder = {
  steps: Array<[StepName, StepState]>
  progress: number[]
}
const recorder = (): Recorder => ({ steps: [], progress: [] })

const stepStatusLayer = (rec: Recorder) =>
  Layer.succeed(StepStatus, {
    set: (name, state) =>
      Effect.sync(() => {
        rec.steps.push([name, state])
      }),
  })

const progressLayer = (rec: Recorder) =>
  Layer.succeed(ProgressReporter, {
    set: (p) =>
      Effect.sync(() => {
        rec.progress.push(p)
      }),
  })

type DiskOps = Context.Tag.Service<typeof DiskApi>
type ImageOps = Context.Tag.Service<typeof ImageApi>
type SnapshotOps = Context.Tag.Service<typeof SnapshotApi>

const okDiskApi = (overrides: Partial<DiskOps> = {}): DiskOps => ({
  create: () => Effect.succeed(stubDisk('disk-1', 'importing_from_bulk_writes')),
  view: () => Effect.succeed(stubDisk('disk-1', 'detached')),
  delete: () => Effect.void,
  bulkWriteStart: () => Effect.void,
  bulkWriteStop: () => Effect.void,
  bulkWrite: () => Effect.void,
  finalize: () => Effect.void,
  ...overrides,
})

const stubImage = (id: string): Image => ({ id }) as unknown as Image

const okImageApi = (overrides: Partial<ImageOps> = {}): ImageOps => ({
  create: () => Effect.succeed(stubImage('image-1')),
  nameExists: () => Effect.succeed(false),
  ...overrides,
})

const okSnapshotApi = (overrides: Partial<SnapshotOps> = {}): SnapshotOps => ({
  view: () => Effect.succeed(stubSnapshot('snap-1')),
  delete: () => Effect.void,
  ...overrides,
})

const baseInput = (overrides: Partial<UploadInput> = {}): UploadInput => ({
  imageName: 'my-image',
  imageDescription: 'desc',
  // 100 bytes of 0x01 — small so we get one chunk; non-zero so bulkWrite isn't skipped
  imageFile: new File([new Uint8Array(100).fill(1)], 'test.iso'),
  blockSize: 512,
  os: 'linux',
  version: '1',
  ...overrides,
})

const stepNames = (rec: Recorder) => rec.steps.map(([n]) => n)

describe('uploadFlow', () => {
  it('runs all steps in order and finalizers fire on success', async () => {
    const rec = recorder()
    const layer = Layer.mergeAll(
      Layer.succeed(DiskApi, okDiskApi()),
      Layer.succeed(ImageApi, okImageApi()),
      Layer.succeed(SnapshotApi, okSnapshotApi()),
      stepStatusLayer(rec),
      progressLayer(rec)
    )

    const exit = await Effect.runPromiseExit(
      uploadFlow(baseInput()).pipe(Effect.provide(layer))
    )

    expect(Exit.isSuccess(exit)).toBe(true)
    expect(stepNames(rec)).toEqual([
      'createDisk',
      'createDisk',
      'importStart',
      'importStart',
      'upload',
      'upload',
      'importStop',
      'importStop',
      'finalize',
      'finalize',
      'createImage',
      'createImage',
      'cleanup',
      'cleanup',
    ])
    // each non-cleanup step transitions running → success; cleanup also ends success
    expect(rec.steps.filter(([, s]) => s === 'success').map(([n]) => n)).toEqual([
      'createDisk',
      'importStart',
      'upload',
      'importStop',
      'finalize',
      'createImage',
      'cleanup',
    ])
    expect(rec.progress.at(-1)).toBe(100)
  })

  it('surfaces API errors and still runs the disk-cleanup finalizer', async () => {
    const rec = recorder()
    const deleteSpy = vi.fn(() => Effect.void)
    const layer = Layer.mergeAll(
      Layer.succeed(
        DiskApi,
        okDiskApi({
          bulkWriteStart: () => Effect.fail(apiErr),
          delete: deleteSpy,
          // disk view returns 'detached' so cleanup just deletes — no extra calls
          view: () => Effect.succeed(stubDisk('disk-1', 'detached')),
        })
      ),
      Layer.succeed(ImageApi, okImageApi()),
      Layer.succeed(SnapshotApi, okSnapshotApi()),
      stepStatusLayer(rec),
      progressLayer(rec)
    )

    const exit = await Effect.runPromiseExit(
      uploadFlow(baseInput()).pipe(Effect.provide(layer))
    )

    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      // typed failure, not a defect
      expect(Cause.failureOption(exit.cause)._tag).toBe('Some')
    }
    expect(stepNames(rec)).toContain('cleanup')
    // cleanup ran to completion
    expect(rec.steps.filter(([n, s]) => n === 'cleanup' && s === 'success')).toHaveLength(1)
    expect(deleteSpy).toHaveBeenCalledTimes(1)
    // importStart was the failing step
    expect(rec.steps).toContainEqual(['importStart', 'error'])
  })

  it('runs the import-mode bracket release and disk-cleanup finalizer on interrupt', async () => {
    const rec = recorder()
    const reached = await Effect.runPromise(Deferred.make<undefined>())
    const deleteSpy = vi.fn(() => Effect.void)
    const stopSpy = vi.fn(() => Effect.void)

    const layer = Layer.mergeAll(
      Layer.succeed(
        DiskApi,
        okDiskApi({
          // park inside the upload (use) phase of acquireUseRelease so the
          // bracket release will fire on interrupt
          bulkWrite: () =>
            Deferred.succeed(reached, undefined).pipe(Effect.zipRight(Effect.never)),
          delete: deleteSpy,
          bulkWriteStop: stopSpy,
          // after the bracket release runs bulkWriteStop, the disk is in
          // import_ready; cleanup takes the finalize-then-delete branch
          view: () => Effect.succeed(stubDisk('disk-1', 'import_ready')),
          finalize: () => Effect.void,
        })
      ),
      Layer.succeed(ImageApi, okImageApi()),
      Layer.succeed(SnapshotApi, okSnapshotApi()),
      stepStatusLayer(rec),
      progressLayer(rec)
    )

    const fiber = Effect.runFork(uploadFlow(baseInput()).pipe(Effect.provide(layer)))
    await Effect.runPromise(Deferred.await(reached))
    const exit = await Effect.runPromise(Fiber.interrupt(fiber))

    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      expect(Cause.isInterruptedOnly(exit.cause)).toBe(true)
    }
    // bracket release fired bulkWriteStop, transitioning out of import mode
    expect(stopSpy).toHaveBeenCalledTimes(1)
    // disk cleanup ran delete after the bracket released
    expect(deleteSpy).toHaveBeenCalledTimes(1)
    expect(rec.steps).toContainEqual(['cleanup', 'success'])
  })
})

describe('submitProgram', () => {
  it('fails with ImageNameTaken when the name is in use, without opening the modal', async () => {
    const rec = recorder()
    const onPrecheckPassed = vi.fn()
    const layer = Layer.mergeAll(
      Layer.succeed(DiskApi, okDiskApi()),
      Layer.succeed(ImageApi, okImageApi({ nameExists: () => Effect.succeed(true) })),
      Layer.succeed(SnapshotApi, okSnapshotApi()),
      stepStatusLayer(rec),
      progressLayer(rec)
    )

    const exit = await Effect.runPromiseExit(
      submitProgram(baseInput(), onPrecheckPassed).pipe(Effect.provide(layer))
    )

    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      const failure = Cause.failureOption(exit.cause)
      expect(failure._tag).toBe('Some')
      if (failure._tag === 'Some') {
        expect(failure.value).toBeInstanceOf(ImageNameTaken)
      }
    }
    expect(onPrecheckPassed).not.toHaveBeenCalled()
    // upload never started
    expect(stepNames(rec)).not.toContain('createDisk')
  })

  it('calls onPrecheckPassed once and runs the upload when the name is free', async () => {
    const rec = recorder()
    const onPrecheckPassed = vi.fn()
    const layer = Layer.mergeAll(
      Layer.succeed(DiskApi, okDiskApi()),
      Layer.succeed(ImageApi, okImageApi()),
      Layer.succeed(SnapshotApi, okSnapshotApi()),
      stepStatusLayer(rec),
      progressLayer(rec)
    )

    const exit = await Effect.runPromiseExit(
      submitProgram(baseInput(), onPrecheckPassed).pipe(Effect.provide(layer))
    )

    expect(Exit.isSuccess(exit)).toBe(true)
    expect(onPrecheckPassed).toHaveBeenCalledTimes(1)
    expect(stepNames(rec)).toContain('createDisk')
    expect(stepNames(rec)).toContain('createImage')
  })
})
