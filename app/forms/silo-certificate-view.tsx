/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

import { api, q, queryClient, usePrefetchedQuery } from '@oxide/api'
import { Key16Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { titleCrumb } from '~/hooks/use-crumbs'
import { CopyToClipboard } from '~/ui/lib/CopyToClipboard'
import { DateTime } from '~/ui/lib/DateTime'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import { Message } from '~/ui/lib/Message'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { Truncate } from '~/ui/lib/Truncate'
import { parseCertChain, type ParsedCert } from '~/util/certificate'
import { pb } from '~/util/path-builder'

import type { Route } from './+types/silo-certificate-view'

const certView = (silo: string, certificate: string) =>
  q(api.siloCertificateView, { path: { certificate }, query: { silo } })

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { silo, certificate } = params
  await queryClient.prefetchQuery(certView(silo, certificate))
  return null
}

export const handle = titleCrumb('Certificate')

export default function SiloCertificateView({ params }: Route.ComponentProps) {
  const { silo, certificate } = params
  const navigate = useNavigate()
  const { data: cert } = usePrefetchedQuery(certView(silo, certificate))

  // fingerprinting uses WebCrypto, which is async
  const { data: chain, isPending } = useQuery({
    queryKey: ['parseCertChain', cert.id, cert.timeModified],
    queryFn: () => parseCertChain(cert.cert),
  })
  const leaf = chain?.[0]

  return (
    <ReadOnlySideModalForm
      title="Certificate details"
      onDismiss={() => navigate(pb.siloCertificates({ silo }))}
      subtitle={
        <ResourceLabel>
          <Key16Icon /> {cert.name}
        </ResourceLabel>
      }
    >
      <PropertiesTable>
        <PropertiesTable.DescriptionRow description={cert.description} />
        <PropertiesTable.ResourceRows resource={cert} />
      </PropertiesTable>

      {/* chain is null when parsing failed, undefined while pending */}
      {!isPending && !leaf && (
        <Message
          variant="notice"
          title="Couldn't parse certificate"
          content="Expected one or more X.509 certificates in PEM format."
        />
      )}
      {leaf && <LeafProperties leaf={leaf} />}
      {chain && chain.length > 1 && <ChainList chain={chain} />}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <FieldLabel id="cert-pem-label">PEM</FieldLabel>
          <CopyToClipboard text={cert.cert} />
        </div>
        <pre
          aria-labelledby="cert-pem-label"
          className="text-mono-sm text-raise bg-raise border-secondary max-h-80 overflow-auto rounded-md border p-3 normal-case!"
        >
          {cert.cert.trim()}
        </pre>
      </div>
    </ReadOnlySideModalForm>
  )
}

function LeafProperties({ leaf }: { leaf: ParsedCert }) {
  const expired = leaf.notAfter < new Date()
  return (
    <PropertiesTable>
      <PropertiesTable.Row label="Domains">
        <ul>
          {leaf.domains.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </PropertiesTable.Row>
      <PropertiesTable.Row label="Issuer">
        <span className="flex min-w-0 items-center gap-2">
          <Truncate text={leaf.issuer} />
          {leaf.selfSigned && <Badge color="neutral">Self-signed</Badge>}
        </span>
      </PropertiesTable.Row>
      <PropertiesTable.Row label="Valid from">
        <DateTime date={leaf.notBefore} />
      </PropertiesTable.Row>
      <PropertiesTable.Row label="Expires">
        <span className="flex items-center gap-2">
          <DateTime date={leaf.notAfter} />
          {expired && <Badge color="destructive">Expired</Badge>}
        </span>
      </PropertiesTable.Row>
      <PropertiesTable.Row label="Key">{leaf.keyAlgorithm}</PropertiesTable.Row>
      <PropertiesTable.Row label="Serial">
        <Truncate text={leaf.serialNumber} position="middle" hasCopyButton />
      </PropertiesTable.Row>
      <PropertiesTable.Row label="SHA-256">
        <Truncate text={leaf.sha256Fingerprint} position="middle" hasCopyButton />
      </PropertiesTable.Row>
    </PropertiesTable>
  )
}

function chainLabel(i: number, length: number, selfSigned: boolean) {
  if (i === 0) return 'Leaf'
  // only call the last cert a root if it's actually self-signed; chains often
  // stop at an intermediate and leave the root to the client's trust store
  if (i === length - 1 && selfSigned) return 'Root'
  return `Intermediate ${i}`
}

function ChainList({ chain }: { chain: ParsedCert[] }) {
  return (
    <div>
      <FieldLabel id="cert-chain-label" className="mb-2">
        Chain ({chain.length} certificates)
      </FieldLabel>
      <ol aria-labelledby="cert-chain-label" className="text-sans-md space-y-2">
        {chain.map((c, i) => (
          <li key={c.sha256Fingerprint}>
            <div className="text-raise">
              {chainLabel(i, chain.length, c.selfSigned)}: {c.subject}
            </div>
            <div className="text-secondary">Issued by {c.issuer}</div>
          </li>
        ))}
      </ol>
    </div>
  )
}
