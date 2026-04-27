/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { LoaderFunctionArgs } from 'react-router'

import { api, q, queryClient, usePrefetchedQuery } from '@oxide/api'

import { EditImageSideModalForm } from '~/forms/image-edit'
import { titleCrumb } from '~/hooks/use-crumbs'
import { getProjectImageSelector, useProjectImageSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const imageView = ({ image, project }: PP.Image) =>
  q(api.imageView, { path: { image }, query: { project } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getProjectImageSelector(params)
  await queryClient.prefetchQuery(imageView(selector))
  return null
}

export const handle = titleCrumb('Edit Image')

export default function ProjectImageEdit() {
  const selector = useProjectImageSelector()
  const { data } = usePrefetchedQuery(imageView(selector))

  const dismissLink = pb.projectImages({ project: selector.project })
  return <EditImageSideModalForm image={data} dismissLink={dismissLink} type="Project" />
}
