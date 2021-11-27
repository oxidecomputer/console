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

import { getUseApiQuery2 } from './hooks2'
import { Api } from './__generated__/Api'

const api2 = new Api<null>({ baseUrl: basePath })

// The fact that the route functions are groups under keys corresponding to the
// first segment of the path is weird and sort of annoying. It might be the kind
// of the thing I'd want to use a custom template to override. On the other hand
// it's not so bad since all we care about in the console for now is the
// organzations ones.
export const useApiQuery2 = getUseApiQuery2(api2.organizations)
