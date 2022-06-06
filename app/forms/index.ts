import type { FormProps } from 'app/components/form'
import type { ErrorResponse } from '@oxide/api'
import type { SetRequired } from 'type-fest'

/**
 * A form that's built out ahead of time and intended to be re-used dynamically. Fields
 * that are expected to be provided by default are set to optional.
 */
export type CreateFormProps<Values, Data> = Omit<
  Optional<FormProps<Values>, 'id' | 'initialValues' | 'onSubmit'>,
  'children'
> & {
  onSuccess?: (data: Data) => void
  onError?: (err: ErrorResponse) => void
}

export type EditFormProps<Values, Data> = SetRequired<
  CreateFormProps<Values, Data>,
  'initialValues'
>
