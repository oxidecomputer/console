/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import { useController, useForm, type Control } from 'react-hook-form'
import type { Merge } from 'type-fest'

import type { CertificateCreate } from '@oxide/api'

import type { SiloCreateFormValues } from '~/forms/silo-create'
import { Button } from '~/ui/lib/Button'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import * as MiniTable from '~/ui/lib/MiniTable'
import { Modal } from '~/ui/lib/Modal'

import { DescriptionField } from './DescriptionField'
import { ErrorMessage } from './ErrorMessage'
import { FileField } from './FileField'
import { validateName } from './NameField'
import { TextField } from './TextField'

export function TlsCertsField({ control }: { control: Control<SiloCreateFormValues> }) {
  const [showAddCert, setShowAddCert] = useState(false)

  const {
    field: { value: items, onChange, ref },
    fieldState: { error },
  } = useController({
    control,
    name: 'tlsCertificates',
    rules: { required: true },
  })

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
}

const AddCertModal = ({ onDismiss, onSubmit, allNames }: AddCertModalProps) => {
  const { control, handleSubmit } = useForm<CertFormValues>({ defaultValues })

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
