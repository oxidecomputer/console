import type { ErrorResponse } from '@oxide/api'

import type { FormProps } from 'app/components/form'

/**
 * A form that's built out ahead of time and intended to be re-used dynamically. Fields
 * that are expected to be provided by default are set to optional.
 */
export type PrebuiltFormProps<Values, Data> = Omit<
  Optional<FormProps<Values>, 'id' | 'title' | 'initialValues' | 'onSubmit' | 'mutation'>,
  'children'
> & {
  onSuccess?: (data: Data) => void
  onError?: (err: ErrorResponse) => void
}
