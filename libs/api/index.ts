import { getUseApi } from './hooks'

import { DefaultApi, Configuration } from './__generated__'

const basePath =
  process.env.NODE_ENV === 'production' ? process.env.API_URL : '/api'

const config = new Configuration({ basePath })
const api = new DefaultApi(config)

export const useApi = getUseApi(api)

export * from './__generated__/models'
