export * from './__generated__'
export * from './hooks'

import { DefaultApi, Configuration } from './__generated__'

const config =
  process.env.NODE_ENV === 'production'
    ? new Configuration({ basePath: process.env.API_URL })
    : new Configuration({ basePath: '/api' })

export const api = new DefaultApi(config)
