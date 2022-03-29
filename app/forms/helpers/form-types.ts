import type { FormProps } from '@oxide/form'
import type { ComponentType } from 'react'
import type { CreateSubnetForm } from '../subnet-create'
import type { EditSubnetForm } from '../subnet-edit'
import type { CreateOrgForm } from '../org-create'
import type { CreateDiskForm } from '../disk-create'
import type { CreateProjectForm } from '../project-create'

/**
 * A form that defines everything it needs
 */
export type BaseFormProps<Values> = Omit<
  Optional<FormProps<Values>, 'id' | 'title' | 'initialValues' | 'onSubmit'>,
  'children'
> & { children?: never }

/**
 * A form that builds off of a base form
 */
export type ExtendedFormProps<C> = C extends ComponentType<infer B>
  ? B extends BaseFormProps<any>
    ? RequiredByKey<B, 'id' | 'title' | 'initialValues' | 'onSubmit'>
    : never
  : never

export interface FormTypes {
  'org-create': typeof CreateOrgForm
  'project-create': typeof CreateProjectForm
  'disk-create': typeof CreateDiskForm
  'subnet-create': typeof CreateSubnetForm
  'subnet-edit': typeof EditSubnetForm
}
