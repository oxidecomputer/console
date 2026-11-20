/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import * as R from 'remeda'

import { api, q } from '@oxide/api'
import { Monitoring16Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { getDocs } from '~/components/oxql-metrics/timeseries-docs'
import { FormDivider } from '~/ui/lib/Divider'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'

export const timeseriesSchemasQuery = q(api.systemTimeseriesSchemaList, {
  query: { limit: ALL_ISH },
})

const DocsList = ({ children }: { children: ReactNode }) => (
  <ul className="bg-default border-default divide-secondary divide-y rounded-lg border">
    {children}
  </ul>
)

function DocsItem({
  name,
  type,
  description,
}: {
  name: string
  type?: string
  description?: string
}) {
  return (
    <li className="flex flex-col gap-1 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="text-sans-md text-raise">{name}</span>
        {type && <Badge>{type}</Badge>}
      </div>
      {description && <p className="text-sans-md text-secondary pr-12">{description}</p>}
    </li>
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
      // the <wbr> lets long names wrap at the colon instead of mid-word. the
      // span keeps it inline: as a direct flex child it would be blockified,
      // which puts a space in the accessible name
      subtitle={
        <ResourceLabel>
          <Monitoring16Icon />
          <span>
            {target}:<wbr />
            {metric}
          </span>
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
        <>
          <FormDivider />
          <div className="flex flex-col gap-2">
            <h4 className="text-mono-sm text-secondary">Description</h4>
            <Description text={docs.description.metric} />
          </div>
        </>
      )}
      <FormDivider />
      <div className="flex flex-col gap-2">
        <h4 className="text-mono-sm text-secondary">Target</h4>
        <DocsList>
          <DocsItem name={target} description={docs.description?.target} />
        </DocsList>
      </div>
      {docs.fields.length > 0 && (
        <>
          <FormDivider />
          <div className="flex flex-col gap-2">
            <h4 className="text-mono-sm text-secondary">Fields</h4>
            <DocsList>
              {R.sortBy(docs.fields, (f) => f.name).map((f) => (
                <DocsItem
                  key={f.name}
                  name={f.name}
                  type={f.fieldType}
                  description={f.description}
                />
              ))}
            </DocsList>
          </div>
        </>
      )}
      {docs.docsHref && (
        <SideModalFormDocs
          docs={[{ href: docs.docsHref, linkText: docLinks.oxqlSchemas.linkText }]}
        />
      )}
    </ReadOnlySideModalForm>
  )
}
