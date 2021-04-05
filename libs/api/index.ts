export * from './__generated__'
export * from './hooks'

import { DefaultApi, Configuration } from './__generated__'

const config =
  process.env.NODE_ENV === 'production'
    ? new Configuration({ basePath: process.env.API_URL })
    : new Configuration({ basePath: '/api' })

export const api = new DefaultApi(config)

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
