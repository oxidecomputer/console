export * from './generated'
export * from './hooks'

import { DefaultApi, Configuration } from './generated'
import mockApi from './mock'

function getDevApi() {
  const config = new Configuration({ basePath: '/api' })
  const api = new DefaultApi(config)

  // the API methods rely on `this` being bound to the API object. in order to
  // pass the methods around as arguments without explicitly calling .bind(this)
  // every time, we just bind them all right here. TS doesn't like this, so we throw
  // an `any` in there, but it's all above board.
  Object.getOwnPropertyNames(DefaultApi.prototype)
    .filter((prop) => prop.startsWith('api'))
    .forEach((prop) => {
      const key = prop as keyof DefaultApi
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(api as any)[key] = api[key].bind(api)
    })

  return api
}

const env = process.env.NODE_ENV
export const api =
  env === 'production' || env === 'test' ? mockApi : getDevApi()
