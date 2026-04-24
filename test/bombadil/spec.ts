// Default bombadil spec — balanced mix for general exploration. Other
// action mixes live in sibling spec-*.ts files. To run:
//
//   1. In one terminal, start the mock Nexus API at :12220:
//        npx tsx tools/start_mock_api.ts
//   2. In another terminal, build & serve with the Nexus proxy enabled
//      (the MSW service worker does not register inside Bombadil's browser,
//      so we hit a real HTTP mock instead of MSW in-browser):
//        API_MODE=nexus npm run build && npx vite preview --port 4174
//   3. Run the test:
//        npm run bombadil
//
// Why not MSW: Bombadil's browser does not register service workers, so
// `setupWorker().start()` never resolves and React never mounts. See:
//   https://github.com/antithesishq/bombadil/issues/98
//   https://github.com/antithesishq/bombadil/issues/105
import { weighted } from '@antithesishq/bombadil'
import {
  back,
  clicks,
  forward,
  inputs,
  navigation,
  reload,
  scroll,
  waitOnce,
} from '@antithesishq/bombadil/defaults/actions'

export * from './spec-shared.ts'

export const defaultActions = weighted([
  [5, inputs],
  [3, clicks],
  [2, navigation],
  [1, scroll],
  [1, back],
  [1, forward],
  [1, reload],
  [1, waitOnce],
])
