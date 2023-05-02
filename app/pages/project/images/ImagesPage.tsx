import type { LoaderFunctionArgs } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { DateCell, SizeCell, useQueryTable } from '@oxide/table'
import {
  EmptyMessage,
  Images24Icon,
  PageHeader,
  PageTitle,
  TableActions,
  buttonStyle,
} from '@oxide/ui'

import { getProjectSelector, useProjectSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Images24Icon />}
    title="No images"
    body="You need to create an image to be able to see it here"
    // buttonText="New image"
    // buttonTo="new"
  />
)

ImagesPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project } = getProjectSelector(params)
  await apiQueryClient.prefetchQuery('imageList', {
    query: { project, limit: 10 },
  })
  return null
}

export function ImagesPage() {
  const projectSelector = useProjectSelector()
  const { Table, Column } = useQueryTable('imageList', { query: projectSelector })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Images24Icon />}>Images</PageTitle>
      </PageHeader>
      <TableActions>
        <Link
          to={pb.projectImageNew(projectSelector)}
          className={buttonStyle({ size: 'sm' })}
        >
          Upload image
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />}>
        <Column accessor="name" />
        <Column accessor="description" />
        <Column accessor="size" cell={SizeCell} />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
