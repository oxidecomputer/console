import { useNavigate } from 'react-router-dom'
import { useParams } from 'app/hooks'

export function useProjectNavItems() {
  const { orgName, projectName } = useParams('orgName', 'projectName')
  const projectPath = `/orgs/${orgName}/projects/${projectName}/`
  const navigate = useNavigate()
  return [
    {
      value: 'Instances',
      onSelect: () => navigate(projectPath + 'instances'),
    },
    {
      value: 'Snapshots',
      onSelect: () => navigate(projectPath + 'snapshots'),
    },
    {
      value: 'Disks',
      onSelect: () => navigate(projectPath + 'disks'),
    },
  ]
}
