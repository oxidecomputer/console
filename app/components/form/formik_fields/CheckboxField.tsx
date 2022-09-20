import type { FieldAttributes } from 'formik'
import { Field } from 'formik'

import type { CheckboxProps } from '@oxide/ui'
import { Checkbox } from '@oxide/ui'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CheckboxFieldProps = CheckboxProps & Omit<FieldAttributes<any>, 'type'>

/** Formik Field version of Checkbox */
export const CheckboxField = (props: CheckboxFieldProps) => (
  <Field type="checkbox" as={Checkbox} {...props} />
)
