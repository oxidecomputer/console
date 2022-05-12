import type { Vpc } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { useParams } from 'app/hooks'
import { useField } from 'formik'
import type { ComboboxFieldProps } from './ComboboxField'
import { ComboboxField } from './ComboboxField'

type SubnetComboboxProps = Omit<ComboboxFieldProps, 'items'> & {
  vpcNameField: string
  // used to only fetch subnets when the vpcName is real. we could fetch the
  // list in here too, but we'd have to make sure the params match exactly to
  // ensure RQ dedupes the request
  vpcs: Vpc[]
}

/**
 * Read the selected VPC name from the Formik context and fetch the subnets for
 * that VPC. Only fetch if the VPC name is that of an existing VPC.
 *
 * Needs to be its own component so it can go *inside* the `<Formik>` element in
 * order to have access to the context.
 */
export function SubnetCombobox({ vpcNameField, vpcs, ...fieldProps }: SubnetComboboxProps) {
  const pathParams = useParams('orgName', 'projectName')
  const [, { value: vpcNameRaw }] = useField<string>({ name: vpcNameField })

  const vpcName = vpcNameRaw.trim()

  const vpcExists = vpcName.length > 0 && vpcs.map((x) => x.name).includes(vpcName)

  // TODO: error handling other than fallback to empty list?
  const subnets =
    useApiQuery(
      'vpcSubnetsGet',
      { ...pathParams, vpcName, limit: 50 },
      {
        enabled: vpcExists,
        useErrorBoundary: false,
      }
    ).data?.items || []

  return (
    <ComboboxField
      {...fieldProps}
      items={subnets.map((x) => x.name)}
      disabled={!vpcExists}
    />
  )
}
