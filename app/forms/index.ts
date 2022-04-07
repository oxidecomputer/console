import type { CreateSubnetForm } from './subnet-create'
import type { EditSubnetForm } from './subnet-edit'
import type { CreateOrgForm } from './org-create'
import type { CreateDiskForm } from './disk-create'
import type { CreateProjectForm } from './project-create'

import type { FormProps } from '@oxide/form'
import type { ErrorResponse } from '@oxide/api'
import type { ComponentType } from 'react'
import type { PathParam } from 'app/routes'

/**
 * A map of all existing forms. When a new form is created in the forms directory, a
 * new entry should be added here with the key of the string name of the form's filename
 * and a value of the form's type. There's a test to validate that this happens.
 */
export interface FormTypes {
  'org-create': typeof CreateOrgForm
  'project-create': typeof CreateProjectForm
  'disk-create': typeof CreateDiskForm
  'subnet-create': typeof CreateSubnetForm
  'subnet-edit': typeof EditSubnetForm
}

export type FormValues<K extends keyof FormTypes> = ExtractFormValues<
  FormTypes[K]
>

/**
 * A form that's built out ahead of time and intended to be re-used dynamically. Fields
 * that are expected to be provided by default are set to optional.
 */
export type PrebuiltFormProps<
  Values,
  Data,
  RouteParams extends readonly PathParam[]
> = Omit<
  Optional<
    FormProps<Values, Record<RouteParams[number], string>>,
    'id' | 'title' | 'initialValues' | 'onSubmit' | 'mutation'
  >,
  'children'
> & {
  children?: never
  onSuccess?: (data: Data, params: Record<RouteParams[number], string>) => void
  onError?: (err: ErrorResponse) => void
}

/**
 * A utility type for a prebuilt form that extends another form
 */
export type ExtendedPrebuiltFormProps<
  C,
  D,
  RouteParams extends readonly PathParam[]
> = C extends ComponentType<infer B>
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    B extends PrebuiltFormProps<infer V, any, RouteParams>
    ? PrebuiltFormProps<V, D, RouteParams>
    : never
  : never

export type ExtractFormValues<C> = C extends ComponentType<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PrebuiltFormProps<infer V, any, any>
>
  ? V
  : never
