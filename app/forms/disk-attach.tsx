import type { DiskIdentifier, ErrorResult } from '@oxide/api'
import { useApiQuery } from '@oxide/api'

import { ListboxField, SideModalForm } from 'app/components/form'
import { useProjectSelector } from 'app/hooks'

const defaultValues = { name: '' }

type AttachDiskProps = {
  /** If defined, this overrides the usual mutation */
  onSubmit: (diskAttach: DiskIdentifier) => void
  onDismiss: () => void
  loading?: boolean
  submitError?: ErrorResult | null
}

/**
 * Can be used with either a `setState` or a real mutation as `onSubmit`, hence
 * the optional `loading` and `submitError`
 */
export function AttachDiskSideModalForm({
  onSubmit,
  onDismiss,
  loading,
  submitError = null,
}: AttachDiskProps) {
  const projectSelector = useProjectSelector()

  // TODO: loading state? because this fires when the modal opens and not when
  // they focus the combobox, it will almost always be done by the time they
  // click in
  // TODO: error handling
  const detachedDisks =
    useApiQuery('diskList', { query: projectSelector }).data?.items.filter(
      (d) => d.state.state === 'detached'
    ) || []

  return (
    <SideModalForm
      id="form-disk-attach"
      title="Attach Disk"
      formOptions={{ defaultValues }}
      onSubmit={onSubmit}
      loading={loading}
      submitError={submitError}
      onDismiss={onDismiss}
    >
      {({ control }) => (
        <ListboxField
          label="Disk name"
          name="name"
          items={detachedDisks.map(({ name }) => ({ value: name, label: name }))}
          control={control}
        />
      )}
    </SideModalForm>
  )
}

export default AttachDiskSideModalForm
