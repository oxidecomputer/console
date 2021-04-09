import { getUseApi } from './hooks'

import { DefaultApi, Configuration } from './__generated__'

const config =
  process.env.NODE_ENV === 'production'
    ? new Configuration({ basePath: process.env.API_URL })
    : new Configuration({ basePath: '/api' })

const api = new DefaultApi(config)

export const useApi = getUseApi(api)
export * from './__generated__'
