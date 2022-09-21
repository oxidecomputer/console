import { useNavigate } from 'react-router-dom'

import { CreateInstanceForm } from 'app/forms/instance-create'
import { useRequiredParams } from 'app/hooks'

export function InstanceCreatePage() {
  const navigate = useNavigate()
  const { orgName, projectName } = useRequiredParams('orgName', 'projectName')
  return (
    <CreateInstanceForm
      onSuccess={(instance) =>
        navigate(`/orgs/${orgName}/projects/${projectName}/instances/${instance.name}`)
      }
    />
  )
}
