// TODO: Make these just be default exports

import type { CreateSubnetForm } from './subnet-create'
import type { EditSubnetForm } from './subnet-edit'
import type { CreateOrgForm } from './org-create'
import type { CreateDiskForm } from './disk-create'
import type { CreateProjectForm } from './project-create'
import type { CreateVpcForm } from './vpc-create'
import type { CreateVpcRouterForm } from './vpc-router-create'
import type { EditVpcRouterForm } from './vpc-router-edit'
import type CreateInstanceForm from './instance-create'
import type AttachDiskForm from './disk-attach'
import type CreateNetworkInterfaceForm from './network-interface-create'

import type { FormProps } from 'app/components/form'
import type { ErrorResponse } from '@oxide/api'

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
  'network-interface-create': typeof CreateNetworkInterfaceForm
  'vpc-create': typeof CreateVpcForm
  'vpc-router-create': typeof CreateVpcRouterForm
  'vpc-router-edit': typeof EditVpcRouterForm
}

/**
 * A form that's built out ahead of time and intended to be re-used dynamically. Fields
 * that are expected to be provided by default are set to optional.
 */
export type PrebuiltFormProps<Values, Data> = Omit<
  Optional<FormProps<Values>, 'id' | 'title' | 'initialValues' | 'onSubmit' | 'mutation'>,
  'children'
> & {
  children?: never
  onSuccess?: (data: Data) => void
  onError?: (err: ErrorResponse) => void
}
