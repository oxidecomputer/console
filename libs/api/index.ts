import { DefaultApi, Configuration } from './__generated__'
import {
  getUseApiQuery,
  getUseApiMutation,
  getUseApiQueryClient,
} from './hooks'

const basePath =
  process.env.NODE_ENV === 'production' ? process.env.API_URL : '/api'

const config = new Configuration({
  basePath,
  headers: {
    // privileged test user
    // we're going to use this both locally and on gcp for now
    // TODO: make configurable through env vars?
    'oxide-authn-spoof': '001de000-05e4-0000-0000-000000004007',
  },
})
const api = new DefaultApi(config)

export const useApiQuery = getUseApiQuery(api)
export const useApiMutation = getUseApiMutation(api)
export const useApiQueryClient = getUseApiQueryClient<DefaultApi>()

export type { ApiError } from './hooks'
export * from './__generated__/models'
export * from './instance-can'
