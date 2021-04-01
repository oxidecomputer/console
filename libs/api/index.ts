export * from './__generated__'
export * from './hooks'

import { DefaultApi, Configuration } from './__generated__'

const prodConfig = new Configuration({ basePath: '/api' })
const devConfig = new Configuration({ basePath: '/api' })

const api =
  process.env.NODE_ENV === 'production'
    ? new DefaultApi(prodConfig)
    : new DefaultApi(devConfig)

export { api }

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
