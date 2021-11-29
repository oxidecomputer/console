import {
  getUseApiMutation,
  getUseApiQuery,
  getUseApiQueryClient,
} from './hooks'
import { Api } from './__generated__/Api'

export * from './instance-can'
export * from './__generated__/Api'
export type { ErrorResponse } from './hooks'

const basePath =
  process.env.NODE_ENV === 'production' ? process.env.API_URL : '/api'

const api = new Api({ baseUrl: basePath })

// The fact that the route functions are groups under keys corresponding to the
// first segment of the path is weird and sort of annoying. It might be the kind
// of the thing I'd want to use a custom template to override. On the other hand
// it's not so bad since all we care about in the console for now is the
// organzations ones.
export const useApiQuery = getUseApiQuery(api.organizations)
export const useApiMutation = getUseApiMutation(api.organizations)
export const useApiQueryClient =
  getUseApiQueryClient<typeof api.organizations>()
