import { camelToSnake, isNotNull, processResponseBody, snakeify } from './util'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryParamsType = Record<string, any>

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  path: string
  query?: QueryParamsType
  body?: unknown
  baseUrl?: string
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>

export interface ApiConfig {
  baseUrl?: string
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'signal'>
}

/** Success responses from the API */
export type ApiSuccess<Data> = {
  type: 'success'
  statusCode: number
  headers: Headers
  data: Data
}

// HACK: this has to match what comes from the API in the `Error` schema. We put
// our own copy here so we can test this file statically without generating
// anything
export type ErrorBody = {
  errorCode?: string | null
  message: string
  requestId: string
}

/** 4xx and 5xx responses from the API */
export type ApiError = {
  type: 'error'
  statusCode: number
  headers: Headers
  error: ErrorBody
}

/**
 * JSON parsing or processing errors within the client. Includes raised Error
 * and response body as a string for debugging.
 */
export type ClientError = {
  type: 'client_error'
  error: Error
  statusCode: number
  headers: Headers
  text: string
}

export type ErrorResult = ApiError | ClientError

export type ApiResult<Data> = ApiSuccess<Data> | ErrorResult

/**
 * Convert `Date` to ISO string. Leave other values alone. Used for both request
 * body and query params.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function replacer(_key: string, value: any) {
  if (value instanceof Date) {
    return value.toISOString()
  }
  return value
}

function encodeQueryParam(key: string, value: unknown) {
  return `${encodeURIComponent(camelToSnake(key))}=${encodeURIComponent(
    replacer(key, value)
  )}`
}

/** Query params with null values filtered out. `"?"` included. */
export function toQueryString(rawQuery?: QueryParamsType): string {
  const qs = Object.entries(rawQuery || {})
    .filter(([_key, value]) => isNotNull(value))
    .map(([key, value]) =>
      Array.isArray(value)
        ? value.map((item) => encodeQueryParam(key, item)).join('&')
        : encodeQueryParam(key, value)
    )
    .join('&')
  return qs ? '?' + qs : ''
}

export async function handleResponse<Data>(response: Response): Promise<ApiResult<Data>> {
  const common = { statusCode: response.status, headers: response.headers }

  const respText = await response.text()

  // catch JSON parse or processing errors
  let respJson
  try {
    // don't bother trying to parse empty responses like 204s
    // TODO: is empty object what we want here?
    respJson = respText.length > 0 ? processResponseBody(JSON.parse(respText)) : {}
  } catch (e) {
    return {
      type: 'client_error',
      error: e as Error,
      text: respText,
      ...common,
    }
  }

  if (!response.ok) {
    return {
      type: 'error',
      error: respJson as ErrorBody,
      ...common,
    }
  }

  // don't validate respJson, just assume it matches the type
  return {
    type: 'success',
    data: respJson as Data,
    ...common,
  }
}

export class HttpClient {
  public baseUrl = ''

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  }

  constructor(apiConfig: ApiConfig = {}) {
    Object.assign(this, apiConfig)
  }

  private mergeRequestParams(params: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params,
      headers: {
        ...this.baseApiParams.headers,
        ...params.headers,
      },
    }
  }

  public request = async <Data>({
    body,
    path,
    query,
    baseUrl,
    ...params
  }: FullRequestParams): Promise<ApiResult<Data>> => {
    const requestParams = this.mergeRequestParams(params)

    const url = (baseUrl || this.baseUrl || '') + path + toQueryString(query)

    const response = await fetch(url, {
      ...requestParams,
      headers: {
        'Content-Type': 'application/json',
        ...requestParams.headers,
      },
      body: JSON.stringify(snakeify(body), replacer),
    })

    return handleResponse(response)
  }
}
