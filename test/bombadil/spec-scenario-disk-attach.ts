// Disk attach scenario. The prelude reaches the ephemeral modal state, then
// Bombadil explores locally with the shared invariants running.
import { actions, weighted, type Action } from '@antithesishq/bombadil'
import { clicks, inputs, waitOnce } from '@antithesishq/bombadil/defaults/actions'

export * from './spec-shared.ts'

const prelude: Action[] = [
  'Wait',
  {
    Click: {
      name: 'BUTTON',
      content: 'Attach existing disk',
      point: { x: 749, y: 669 },
    },
  },
  {
    Click: {
      name: 'BUTTON',
      content: 'Select',
      point: { x: 703, y: 395 },
    },
  },
  {
    Click: {
      name: 'DIV',
      content: 'disk-snapshot-error',
      point: { x: 512, y: 447 },
    },
  },
  {
    Click: {
      name: 'BUTTON',
      content: 'Attach disk',
      point: { x: 664, y: 507 },
    },
  },
]

const localActions = weighted([
  [5, clicks],
  [4, inputs],
  [3, waitOnce],
])

let preludeIndex = 0

export const defaultActions = actions(() => {
  const action = prelude[preludeIndex]
  if (action) {
    preludeIndex += 1
    return [action]
  }
  return localActions.generate()
})
