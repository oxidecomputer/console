import type { ErrorResponse } from '@oxide/api'
import type { ComponentType } from 'react'
import type { FormProps } from './Form'

/**
 * A form that's built out ahead of time and intended to be re-used dynamically. Fields
 * that are expected to be provided by default are set to optional.
 */
export type PrebuiltFormProps<Values, Data> = Omit<
  Optional<
    FormProps<Values>,
    'id' | 'title' | 'initialValues' | 'onSubmit' | 'mutation'
  >,
  'children'
> & {
  children?: never
  onSuccess?: (data: Data) => void
  onError?: (err: ErrorResponse) => void
}

/**
 * A utility type for a prebuilt form that extends another form
 */
export type ExtendedPrebuiltFormProps<C, D = void> = C extends ComponentType<
  infer B
>
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    B extends PrebuiltFormProps<infer V, any>
    ? PrebuiltFormProps<V, D>
    : never
  : never

export type ExtractFormValues<C> = C extends ComponentType<
  PrebuiltFormProps<infer V, any>
>
  ? V
  : never
