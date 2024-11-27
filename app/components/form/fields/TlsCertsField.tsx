/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { SubjectAlternativeNameExtension, X509Certificate } from '@peculiar/x509'
import { skipToken, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useController, useForm, type Control } from 'react-hook-form'
import type { Merge } from 'type-fest'

import type { CertificateCreate } from '@oxide/api'
import { OpenLink12Icon } from '@oxide/design-system/icons/react'

import type { SiloCreateFormValues } from '~/forms/silo-create'
import { Button } from '~/ui/lib/Button'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import { Message } from '~/ui/lib/Message'
import * as MiniTable from '~/ui/lib/MiniTable'
import { Modal } from '~/ui/lib/Modal'
import { links } from '~/util/links'

import { DescriptionField } from './DescriptionField'
import { FileField } from './FileField'
import { validateName } from './NameField'
import { TextField } from './TextField'

// default export is most convenient for dynamic import
// eslint-disable-next-line import/no-default-export
export default function TlsCertsField({
  control,
  siloName,
}: {
  control: Control<SiloCreateFormValues>
  siloName: string
}) {
  const [showAddCert, setShowAddCert] = useState(false)

  const {
    field: { value: items, onChange },
  } = useController({ control, name: 'tlsCertificates' })

  return (
    <>
      <div className="max-w-lg">
        <FieldLabel id="tls-certificates-label" className="mb-3">
          TLS Certificates
        </FieldLabel>
        {!!items.length && (
          <MiniTable.Table className="mb-4">
            <MiniTable.Header>
              <MiniTable.HeadCell>Name</MiniTable.HeadCell>
              {/* For remove button */}
              <MiniTable.HeadCell className="w-12" />
            </MiniTable.Header>
            <MiniTable.Body>
              {items.map((item, index) => (
                <MiniTable.Row
                  tabIndex={0}
                  aria-rowindex={index + 1}
                  aria-label={`Name: ${item.name}, Description: ${item.description}`}
                  key={item.name}
                >
                  <MiniTable.Cell>{item.name}</MiniTable.Cell>
                  <MiniTable.RemoveCell
                    onClick={() => onChange(items.filter((i) => i.name !== item.name))}
                    label={`remove cert ${item.name}`}
                  />
                </MiniTable.Row>
              ))}
            </MiniTable.Body>
          </MiniTable.Table>
        )}

        <Button size="sm" onClick={() => setShowAddCert(true)}>
          Add TLS certificate
        </Button>
      </div>

      {showAddCert && (
        <AddCertModal
          onDismiss={() => setShowAddCert(false)}
          onSubmit={async (values) => {
            const certCreate: (typeof items)[number] = {
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
    queryFn: file ? () => validateCertificate(file) : skipToken,
  })

  return (
    <Modal isOpen onDismiss={onDismiss} title="Add TLS certificate">
      <Modal.Body>
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <Modal.Section>
            <TextField
              name="name"
              control={control}
              required
              // this field is identical to NameField (which just does
              // validateName for you) except we also want to check that the
              // name is not in the list of certs you've already added
              validate={(name) => {
                if (allNames.includes(name)) {
                  return 'A certificate with this name already exists'
                }
                return validateName(name, 'Name', true)
              }}
            />
            <DescriptionField name="description" control={control} />
            <FileField
              id="cert-input"
              name="cert"
              label="Cert"
              required
              control={control}
            />
            {siloName && (
              <CertDomainNotice
                {...certValidation}
                siloName={siloName}
                domain="r2.oxide-preview.com"
              />
            )}
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

const validateCertificate = async (file: File) => {
  return parseCertificate(await file.text())
}

function parseCertificate(certPem: string) {
  try {
    const cert = new X509Certificate(certPem)
    const nameItems = cert.getExtension(SubjectAlternativeNameExtension)?.names.items || []
    return {
      commonName: cert.subjectName.getField('CN') || [],
      subjectAltNames: nameItems.map((item) => item.value) || [],
    }
  } catch {
    return null
  }
}

function matchesDomain(pattern: string, domain: string): boolean {
  const patternParts = pattern.split('.')
  const domainParts = domain.split('.')

  if (patternParts.length !== domainParts.length) return false

  return patternParts.every(
    (part, i) => part === '*' || part.toLowerCase() === domainParts[i].toLowerCase()
  )
}

function CertDomainNotice({
  commonName = [],
  subjectAltNames = [],
  siloName,
  domain,
}: {
  commonName?: string[]
  subjectAltNames?: string[]
  siloName: string
  domain: string
}) {
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
        <div className="mt-2 flex flex-col space-y-2">
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
              href={links.systemSiloDocs} // would need updating
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
