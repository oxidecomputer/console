import { useNavigate } from 'react-router-dom'

import { SideModalForm } from 'app/components/form'
import { useProjectSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const defaultValues = {}

export function CreateImageSideModalForm() {
  const navigate = useNavigate()
  const projectSelector = useProjectSelector()

  const onDismiss = () => navigate(pb.projectImages(projectSelector))

  // User inputs a file in a file input
  // [API call] Create a disk in state import-ready
  // [API call] set that disk to state importing-via-bulk-write
  // [1000 API calls] Post file chunks to the API in parallel
  // wait for it to be done
  // [API call] stop the bulk write process
  // [API call] finalize the disk, creating a snapshot
  // [API call] create an image out of that snapshot

  return (
    <SideModalForm
      id="upload-image-form"
      formOptions={{ defaultValues }}
      title="Upload image"
      onDismiss={onDismiss}
      onSubmit={() => {
        alert('submitted')
      }}
      // loading={createProject.isLoading}
      // submitError={createProject.error}
      submitError={null}
    >
      {() => (
        <>
          <input type="file" />
        </>
      )}
    </SideModalForm>
  )
}
