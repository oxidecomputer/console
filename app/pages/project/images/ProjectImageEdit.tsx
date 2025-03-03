/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type LoaderFunctionArgs } from 'react-router'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'

import { EditImageSideModalForm } from '~/forms/image-edit'
import { titleCrumb } from '~/hooks/use-crumbs'
import { getProjectImageSelector, useProjectImageSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project, image } = getProjectImageSelector(params)
  await apiQueryClient.prefetchQuery('imageView', { path: { image }, query: { project } })
  return null
}

export const handle = titleCrumb('Edit Image')

export default function ProjectImageEdit() {
  const { project, image } = useProjectImageSelector()
  const { data } = usePrefetchedApiQuery('imageView', {
    path: { image },
    query: { project },
  })

  const dismissLink = pb.projectImages({ project })
  return <EditImageSideModalForm image={data} dismissLink={dismissLink} type="Project" />
}
