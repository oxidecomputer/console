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
import { useSiloImageSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import type { Route } from './+types/SiloImageDetail'

const imageView = ({ image }: PP.SiloImage) => q(api.imageView, { path: { image } })

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { image } = params
  await queryClient.prefetchQuery(imageView({ image }))
  return null
}

export const handle = titleCrumb('Image')

export default function SiloImageDetail() {
  const selector = useSiloImageSelector()
  const navigate = useNavigate()
  const { data } = usePrefetchedQuery(imageView(selector))

  return <ImageDetailSideModal image={data} onDismiss={() => navigate(pb.siloImages())} />
}
