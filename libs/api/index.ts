import { DefaultApi, Configuration } from './__generated__'
import {
  getUseApiQuery,
  getUseApiMutation,
  getUseApiQueryClient,
} from './hooks'

const basePath =
  process.env.NODE_ENV === 'production' ? process.env.API_URL : '/api'

const config = new Configuration({ basePath })
const api = new DefaultApi(config)

export const useApiQuery = getUseApiQuery(api)
export const useApiMutation = getUseApiMutation(api)
export const useApiQueryClient = getUseApiQueryClient<DefaultApi>()

export type { ApiError } from './hooks'
export * from './__generated__/models'
export * from './instance-can'
