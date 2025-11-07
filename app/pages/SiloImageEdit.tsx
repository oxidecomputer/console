/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type LoaderFunctionArgs } from 'react-router'

import { apiq, queryClient, usePrefetchedQuery } from '@oxide/api'

import { EditImageSideModalForm } from '~/forms/image-edit'
import { titleCrumb } from '~/hooks/use-crumbs'
import { getSiloImageSelector, useSiloImageSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const imageView = ({ image }: PP.SiloImage) => apiq('imageView', { path: { image } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getSiloImageSelector(params)
  await queryClient.prefetchQuery(imageView(selector))
  return null
}

export const handle = titleCrumb('Edit Image')

export default function SiloImageEdit() {
  const selector = useSiloImageSelector()
  const { data } = usePrefetchedQuery(imageView(selector))

  return <EditImageSideModalForm image={data} dismissLink={pb.siloImages()} type="Silo" />
}
