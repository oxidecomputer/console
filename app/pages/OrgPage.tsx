import { Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { buttonStyle } from '@oxide/ui'

import { useParams } from '../hooks'

export default function OrgPage() {
  const { orgName } = useParams('orgName')
  const { data: org } = useApiQuery('organizationView', { orgName })

  if (!org) return null

  return (
    <>
      <div className="space-x-4">
        <Link to="projects/new" className={buttonStyle()}>
          Create project
        </Link>
      </div>
    </>
  )
}
