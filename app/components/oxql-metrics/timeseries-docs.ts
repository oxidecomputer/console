/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { DatumType, FieldSchema, TimeseriesSchema, Units } from '@oxide/api'

import { targets, timeseries } from '~/api/__generated__/timeseries-metadata'
import { docLinks } from '~/util/links'

type Field = Omit<FieldSchema, 'source'>

export type TimeseriesDocs = {
  description?: { target: string; metric: string }
  unit?: Units
  datumType?: DatumType
  fields: Field[]
  docsHref?: string
}

/**
 * The schema endpoint returns empty descriptions and `none` units for
 * everything because ClickHouse doesn't store them, so docs come from the
 * snapshot of omicron's schema files. Undefined for timeseries defined outside
 * omicron.
 */
export function snapshotDocs(name: string): TimeseriesDocs | undefined {
  const metric = timeseries[name]
  const target = metric && targets[metric.target]
  if (!metric || !target) return undefined
  return {
    description: { target: target.description, metric: metric.description },
    unit: metric.units,
    datumType: metric.datumType,
    fields: [...target.fields, ...metric.fields],
    // anchors on the schemas page are the timeseries name minus the colon
    docsHref: `${docLinks.oxqlSchemas.href}#_${name.replace(':', '')}`,
  }
}

/** Prefer the snapshot, falling back to the endpoint for non-omicron timeseries */
export function getDocs(
  name: string,
  schemas: TimeseriesSchema[] | undefined
): TimeseriesDocs {
  const docs = snapshotDocs(name)
  if (docs) return docs
  const schema = schemas?.find((s) => s.timeseriesName === name)
  if (schema) {
    return { datumType: schema.datumType, fields: schema.fieldSchema }
  }
  return { fields: [] }
}
