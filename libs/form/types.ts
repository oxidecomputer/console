import type { FormProps } from './Form'

/**
 * A form that's built out ahead of time and intended to be re-used dynamically. Fields
 * that are expected to be provided by default are set to optional.
 */
export type PrebuiltFormProps<Values> = Omit<
  Optional<FormProps<Values>, 'id' | 'title' | 'initialValues' | 'onSubmit'>,
  'children'
> & { children?: never }
