import {
  getUseApiMutation,
  getUseApiQuery,
  getUseApiQueryClient,
} from './hooks'
// import type { HttpResponse } from './__generated__/Api'
import { Api } from './__generated__/Api'

export * from './instance-can'
export * from './__generated__/Api'
export type { ErrorResponse, Params, Result, ResultItem } from './hooks'

const basePath = process.env.API_URL ?? '/api'

const api = new Api({ baseUrl: basePath })

// The fact that the route functions are grouped under keys corresponding to the
// first segment of the path is weird and sort of annoying. It might be the kind
// of the thing I'd want to use a custom template to override. On the other hand
// it's not so bad since all we care about in the console for now is the
// organzations ones.
export type ApiClient = typeof api.methods
// export type ApiListMethods = PickByValue<
//   ApiClient,
//   (...args: any) => Promise<HttpResponse<{ items: any[] }>>
// >

export const useApiQuery = getUseApiQuery(api.methods)
export const useApiMutation = getUseApiMutation(api.methods)
export const useApiQueryClient = getUseApiQueryClient<ApiClient>()
