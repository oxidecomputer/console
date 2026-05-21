/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { skipToken, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useController, useForm, type Control } from 'react-hook-form'
import type { Merge } from 'type-fest'

import type { CertificateCreate } from '@oxide/api'
import { OpenLink12Icon } from '@oxide/design-system/icons/react'

import { getDelegatedDomain } from '~/forms/idp/util'
import type { SiloCreateFormValues } from '~/forms/silo-create'
import { Button } from '~/ui/lib/Button'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import { Message } from '~/ui/lib/Message'
import { MiniTable } from '~/ui/lib/MiniTable'
import { Modal } from '~/ui/lib/Modal'
import { links } from '~/util/links'

import { DescriptionField } from './DescriptionField'
import { ErrorMessage } from './ErrorMessage'
import { FileField } from './FileField'
import { NameField } from './NameField'

export function TlsCertsField({
  control,
  siloName,
}: {
  control: Control<SiloCreateFormValues>
  siloName: string
}) {
  const [showAddCert, setShowAddCert] = useState(false)

  const {
    field: { value: items, onChange, ref },
    fieldState: { error },
  } = useController({
    control,
    name: 'tlsCertificates',
    rules: {
      // docs recommend validate over required for array-valued field
      // https://react-hook-form.com/docs/useform/register
      validate: (certs) =>
        certs.length < 1 ? 'At least one certificate is required' : undefined,
    },
  })

  return (
    <>
      <div className="max-w-lg">
        <FieldLabel id="tls-certificates-label" className="mb-3">
          TLS Certificates
        </FieldLabel>
        <MiniTable
          className="mb-4"
          ariaLabel="TLS Certificates"
          items={items}
          columns={[{ header: 'Name', cell: (item) => item.name }]}
          rowKey={(item) => item.name}
          onRemoveItem={(item) => onChange(items.filter((i) => i.name !== item.name))}
          removeLabel={(item) => `remove cert ${item.name}`}
        />

        {/* ref on button element allows scrollTo to work when the form has a "missing TLS cert" error */}
        <Button size="sm" onClick={() => setShowAddCert(true)} ref={ref}>
          Add TLS certificate
        </Button>
        <ErrorMessage error={error} label="TLS certificate" />
      </div>

      {showAddCert && (
        <AddCertModal
          onDismiss={() => setShowAddCert(false)}
          onSubmit={async (values) => {
            const certCreate: CertificateCreate = {
              ...values,
              // cert and key are required fields. they will always be present if we get here
              cert: await values.cert!.text(),
              key: await values.key!.text(),
            }
            onChange([...items, certCreate])
            setShowAddCert(false)
          }}
          allNames={items.map((item) => item.name)}
          siloName={siloName}
        />
      )}
    </>
  )
}

export type CertFormValues = Merge<
  CertificateCreate,
  { key: File | null; cert: File | null } // swap strings for Files
>

const defaultValues: CertFormValues = {
  description: '',
  name: '',
  service: 'external_api',
  key: null,
  cert: null,
}

type AddCertModalProps = {
  onDismiss: () => void
  onSubmit: (values: CertFormValues) => void
  allNames: string[]
  siloName: string
}

const AddCertModal = ({ onDismiss, onSubmit, allNames, siloName }: AddCertModalProps) => {
  const { watch, control, handleSubmit } = useForm<CertFormValues>({ defaultValues })

  const file = watch('cert')

  const { data: certValidation } = useQuery({
    queryKey: ['validateImage', ...(file ? [file.name, file.size, file.lastModified] : [])],
    queryFn: file ? () => file.text().then(parseCertificate) : skipToken,
  })

  return (
    <Modal isOpen onDismiss={onDismiss} title="Add TLS certificate">
      <Modal.Body>
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <Modal.Section>
            <NameField
              name="name"
              control={control}
              validate={(name) =>
                allNames.includes(name)
                  ? 'A certificate with this name already exists'
                  : undefined
              }
            />
            <DescriptionField name="description" control={control} />
            <FileField
              id="cert-input"
              name="cert"
              label="Cert"
              required
              control={control}
            />
            <CertDomainNotice
              {...certValidation}
              siloName={siloName}
              domain={getDelegatedDomain(window.location)}
            />
            <FileField id="key-input" name="key" label="Key" required control={control} />
          </Modal.Section>
        </form>
      </Modal.Body>
      <Modal.Footer
        onDismiss={onDismiss}
        onAction={handleSubmit(onSubmit)}
        actionText="Add Certificate"
      />
    </Modal>
  )
}

export async function parseCertificate(certPem: string) {
  // dynamic import to keep 50k gzipped out of the main bundle
  const { SubjectAlternativeNameExtension, X509Certificate } =
    await import('@peculiar/x509')
  try {
    const cert = new X509Certificate(certPem)
    const nameItems = cert.getExtension(SubjectAlternativeNameExtension)?.names.items || []
    return {
      commonName: cert.subjectName.getField('CN') || [],
      subjectAltNames: nameItems.map((item) => item.value) || [],
      isValid: true,
    }
  } catch {
    return {
      commonName: [],
      subjectAltNames: [],
      isValid: false,
    }
  }
}

export function matchesDomain(pattern: string, domain: string): boolean {
  const patternParts = pattern.split('.')
  const domainParts = domain.split('.')

  // unsure if this would be an issue but we reject it anyway
  if (pattern === '*') {
    return false
  }

  if (patternParts[0] === '*') {
    // the domain parts and pattern parts should have the same number of items
    // (prevents *.domain.com from matching test.test.domain.com)
    if (domainParts.length !== patternParts.length) return false
    // the rest should be an exact match
    const patternSuffix = patternParts.slice(1).join('.')
    return domain.endsWith(patternSuffix)
  }

  // parts must match exactly for non-wildcard patterns
  return (
    patternParts.length === domainParts.length &&
    patternParts.every((part, i) => part.toLowerCase() === domainParts[i].toLowerCase())
  )
}

function CertDomainNotice({
  commonName = [],
  subjectAltNames = [],
  isValid = true,
  siloName,
  domain,
}: {
  commonName?: string[]
  subjectAltNames?: string[]
  isValid?: boolean
  siloName: string
  domain: string
}) {
  if (!isValid) {
    return (
      <Message
        variant="info"
        title="Could not be parsed"
        content={
          <div className="flex flex-col space-y-2">
            <div>Expected an X.509 certificate in PEM format.</div>
            <div>
              Learn more about{' '}
              <a
                target="_blank"
                rel="noreferrer"
                href={links.siloTlsCertsDocs}
                className="inline-flex items-center underline"
              >
                silo certs
                <OpenLink12Icon className="ml-1" />
              </a>
            </div>
          </div>
        }
      />
    )
  }

  // Domain matching needs a silo name to compare against
  if (!siloName) return null

  if (commonName.length === 0 && subjectAltNames.length === 0) {
    return null
  }

  const expectedDomain = `${siloName}.sys.${domain}`
  const domains = [...commonName, ...subjectAltNames]

  const matches = domains.some(
    (d) => matchesDomain(d, expectedDomain) || matchesDomain(d, `*.sys.${domain}`)
  )

  if (matches) return null

  return (
    <Message
      variant="info"
      title="Certificate domain mismatch"
      content={
        <div className="flex flex-col space-y-2">
          Expected to match {expectedDomain} <br />
          <div>
            Found:
            <ul className="ml-4 list-disc">
              {domains.map((domain, index) => (
                <li key={index}>{domain}</li>
              ))}
            </ul>
          </div>
          <div>
            Learn more about{' '}
            <a
              target="_blank"
              rel="noreferrer"
              href={links.siloTlsCertsDocs}
              className="inline-flex items-center underline"
            >
              silo certs
              <OpenLink12Icon className="ml-1" />
            </a>
          </div>
        </div>
      }
    />
  )
}
