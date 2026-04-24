// Default bombadil spec using the `balanced` profile. To run:
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
// Other profiles live in sibling spec-<profile>.ts files. See spec-shared.ts
// for the list of profiles and their rationale.
//
// Why not MSW: Bombadil's browser does not register service workers, so
// `setupWorker().start()` never resolves and React never mounts. See:
//   https://github.com/antithesishq/bombadil/issues/98
//   https://github.com/antithesishq/bombadil/issues/105
import { makeActionMix } from './profiles.ts'

export * from './spec-shared.ts'
export const defaultActions = makeActionMix('balanced')
