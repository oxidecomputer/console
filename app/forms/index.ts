import type { CreateSubnetForm } from './subnet-create'
import type { EditSubnetForm } from './subnet-edit'
import type { CreateOrgForm } from './org-create'
import type { CreateDiskForm } from './disk-create'
import type { CreateProjectForm } from './project-create'
import type CreateInstanceForm from './instance-create'
import type { ExtractFormValues } from '@oxide/form'

/**
 * A map of all existing forms. When a new form is created in the forms directory, a
 * new entry should be added here with the key of the string name of the form's filename
 * and a value of the form's type. There's a test to validate that this happens.
 */
export interface FormTypes {
  'org-create': typeof CreateOrgForm
  'project-create': typeof CreateProjectForm
  'instance-create': typeof CreateInstanceForm
  'disk-create': typeof CreateDiskForm
  'subnet-create': typeof CreateSubnetForm
  'subnet-edit': typeof EditSubnetForm
}

export type FormValues<K extends keyof FormTypes> = ExtractFormValues<
  FormTypes[K]
>
