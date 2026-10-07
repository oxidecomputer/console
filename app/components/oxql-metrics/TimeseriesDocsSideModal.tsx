/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import * as R from 'remeda'

import {
  api,
  q,
  type DatumType,
  type FieldSchema,
  type TimeseriesSchema,
  type Units,
} from '@oxide/api'
import { Monitoring16Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { targets, timeseries } from '~/api/__generated__/timeseries-metadata'
import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { ModalLink, ModalLinks } from '~/ui/lib/ModalLinks'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'

export const timeseriesSchemasQuery = q(api.systemTimeseriesSchemaList, {
  query: { limit: ALL_ISH },
})

type Field = Omit<FieldSchema, 'source'>

type TimeseriesDocs = {
  description?: { target: string; metric: string }
  unit?: Units
  datumType?: DatumType
  fields: Field[]
  docsHref?: string
}

// The schema endpoint returns empty descriptions and `none` units for
// everything because ClickHouse doesn't store them, so prefer the snapshot of
// omicron's schema files. The endpoint still covers timeseries defined
// outside omicron.
function getDocs(name: string, schemas: TimeseriesSchema[] | undefined): TimeseriesDocs {
  const metric = timeseries[name]
  const target = metric && targets[metric.target]
  if (metric && target) {
    return {
      description: { target: target.description, metric: metric.description },
      unit: metric.units,
      datumType: metric.datumType,
      fields: [...target.fields, ...metric.fields],
      // anchors on the schemas page are the timeseries name minus the colon
      docsHref: `${docLinks.oxqlSchemas.href}#_${name.replace(':', '')}`,
    }
  }
  const schema = schemas?.find((s) => s.timeseriesName === name)
  if (schema) {
    return { datumType: schema.datumType, fields: schema.fieldSchema }
  }
  return { fields: [] }
}

function FieldList({ fields }: { fields: Field[] }) {
  return (
    <ul className="bg-default border-default divide-secondary divide-y rounded-lg border">
      {fields.map((f) => (
        <li key={f.name} className="flex flex-col gap-1 px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-mono-code text-default">{f.name}</span>
            <span className="text-sans-md text-tertiary">{f.fieldType}</span>
          </div>
          {f.description && <p className="text-sans-sm text-secondary">{f.description}</p>}
        </li>
      ))}
    </ul>
  )
}

/** Odd indices are the captured `code` and *emphasis* spans */
const inlineMarkup = /(`[^`]+`|\*[^*]+\*)/

function Inline({ text }: { text: string }) {
  return text.split(inlineMarkup).map((part, i) =>
    i % 2 === 0 ? (
      part
    ) : part.startsWith('`') ? (
      <code key={i} className="text-mono-code bg-tertiary rounded-sm px-1">
        {part.slice(1, -1)}
      </code>
    ) : (
      <em key={i}>{part.slice(1, -1)}</em>
    )
  )
}

const listItem = /^\d+\. /

/**
 * Some descriptions in omicron's schema files use a little Markdown:
 * paragraphs, a numbered list, `code`, and *emphasis*. Handle just those.
 */
function Description({ text }: { text: string }) {
  return (
    <div className="text-sans-md text-default flex flex-col gap-3">
      {text
        .trim()
        .split(/\n{2,}/)
        .map((para) => {
          const lines = para.split('\n')
          return lines.every((line) => listItem.test(line)) ? (
            <ol key={para} className="flex list-decimal flex-col gap-1 pl-5">
              {lines.map((line) => (
                <li key={line}>
                  <Inline text={line.replace(listItem, '')} />
                </li>
              ))}
            </ol>
          ) : (
            <p key={para}>
              <Inline text={para} />
            </p>
          )
        })}
    </div>
  )
}

export function TimeseriesDocsSideModal({
  name,
  onDismiss,
}: {
  name: string
  onDismiss: () => void
}) {
  // the page fetches the same query, so this is normally a cache hit
  const schemas = useQuery(timeseriesSchemasQuery).data?.items
  const docs = getDocs(name, schemas)
  const [target, metric] = name.split(':')
  return (
    <ReadOnlySideModalForm
      title="Timeseries details"
      // the <wbr> lets long names wrap at the colon instead of mid-word
      subtitle={
        <ResourceLabel>
          <Monitoring16Icon /> {target}:<wbr />
          {metric}
        </ResourceLabel>
      }
      onDismiss={onDismiss}
      animate
    >
      <PropertiesTable>
        <PropertiesTable.Row label="Datum type">
          {docs.datumType ?? '—'}
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Unit">{docs.unit ?? '—'}</PropertiesTable.Row>
      </PropertiesTable>
      {docs.description?.metric && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sans-semi-md text-raise">Description</h4>
          <Description text={docs.description.metric} />
        </div>
      )}
      <div className="flex flex-col items-start gap-2">
        <h4 className="text-sans-semi-md text-raise">Target</h4>
        <Badge color="neutral">
          <span className="normal-case">{target}</span>
        </Badge>
        {docs.description?.target && (
          <p className="text-sans-md text-secondary">{docs.description.target}</p>
        )}
      </div>
      {docs.fields.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sans-semi-md text-raise">Fields</h4>
          <FieldList fields={R.sortBy(docs.fields, (f) => f.name)} />
        </div>
      )}
      {docs.docsHref && (
        <ModalLinks heading="Relevant docs">
          <ModalLink to={docs.docsHref} label={docLinks.oxqlSchemas.linkText} />
        </ModalLinks>
      )}
    </ReadOnlySideModalForm>
  )
}
