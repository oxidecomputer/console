/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useNavigate } from 'react-router'

import { api, q, queryClient, usePrefetchedQuery } from '@oxide/api'

import { ImageDetailSideModal } from '~/components/ImageDetailSideModal'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useProjectImageSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import type { Route } from './+types/ProjectImageDetail'

const imageView = ({ image, project }: PP.Image) =>
  q(api.imageView, { path: { image }, query: { project } })

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { project, image } = params
  await queryClient.prefetchQuery(imageView({ project, image }))
  return null
}

export const handle = titleCrumb('Image')

export default function ProjectImageDetail() {
  const selector = useProjectImageSelector()
  const navigate = useNavigate()
  const { data } = usePrefetchedQuery(imageView(selector))

  const dismissLink = pb.projectImages({ project: selector.project })
  return <ImageDetailSideModal image={data} onDismiss={() => navigate(dismissLink)} />
}
