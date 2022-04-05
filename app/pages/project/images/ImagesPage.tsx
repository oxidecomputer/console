import React from 'react'
import { useParams } from 'app/hooks'
import { SizeCell, DateCell, useQueryTable } from '@oxide/table'

export const ImagesPage = () => {
  const projectParams = useParams('orgName', 'projectName')
  const { Table, Column } = useQueryTable('projectImagesGet', projectParams)
  return (
    <Table>
      <Column id="name" />
      <Column id="description" />
      <Column id="size" cell={SizeCell} />
      <Column id="created" accessor="timeCreated" cell={DateCell} />
    </Table>
  )
}
