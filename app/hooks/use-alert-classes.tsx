/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'

import { type AlertClass, type AlertClassResultsPage, api, q } from '@oxide/api'

import { isSubscribableClass } from '~/api/util'
import { type ComboboxItem } from '~/ui/lib/Combobox'
import { ItemLabel } from '~/ui/lib/ItemLabel'
import { ALL_ISH } from '~/util/consts'

export const alertClassListQuery = q(api.alertClassList, { query: { limit: ALL_ISH } })

export type AlertClassMap = ReadonlyMap<string, AlertClass>

export function alertClassMap(data: AlertClassResultsPage): AlertClassMap {
  return new Map(data.items.filter(isSubscribableClass).map((c) => [c.name, c]))
}

type AlertClassesResult = {
  data: AlertClassResultsPage | undefined
  isPending: boolean
  // undefined while loading so an exact class typed before the list arrives
  // isn't rejected as unknown
  classes: AlertClassMap | undefined
}

export function useAlertClasses(): AlertClassesResult {
  const { data, isPending } = useQuery(alertClassListQuery)
  return { data, isPending, classes: data && alertClassMap(data) }
}

/** Combobox item showing the alert class name with its description underneath */
export const toClassComboboxItem = ({
  name,
  description,
}: {
  name: string
  description: string
}): ComboboxItem => ({
  value: name,
  selectedLabel: name,
  label: <ItemLabel name={name}>{description}</ItemLabel>,
})
