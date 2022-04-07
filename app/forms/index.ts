// TODO: Make these just be default exports

import type { CreateSubnetForm } from './subnet-create'
import type { EditSubnetForm } from './subnet-edit'
import type { CreateOrgForm } from './org-create'
import type { CreateDiskForm } from './disk-create'
import type { CreateProjectForm } from './project-create'
import type CreateInstanceForm from './instance-create'
import type AttachDiskForm from './disk-attach'

import type { FormProps } from '@oxide/form'
import type { ErrorResponse } from '@oxide/api'
import type { ComponentType } from 'react'

/**
 * A map of all existing forms. When a new form is created in the forms directory, a
 * new entry should be added here with the key of the string name of the form's filename
 * and a value of the form's type. There's a test to validate that this happens.
 */
export interface FormTypes {
  'instance-create': typeof CreateInstanceForm
  'org-create': typeof CreateOrgForm
  'project-create': typeof CreateProjectForm
  'disk-attach': typeof AttachDiskForm
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
