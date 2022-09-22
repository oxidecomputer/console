import { useNavigate } from 'react-router-dom'

import { CreateInstanceForm } from 'app/forms/instance-create'
import { useRequiredParams } from 'app/hooks'
import { pb } from 'app/util/path-builder'

export function InstanceCreatePage() {
  const navigate = useNavigate()
  const projectParams = useRequiredParams('orgName', 'projectName')
  return (
    <CreateInstanceForm
      onSuccess={(instance) =>
        navigate(pb.instance({ ...projectParams, instanceName: instance.name }))
      }
      onDismiss={() => navigate(pb.instances(projectParams))}
    />
  )
}
