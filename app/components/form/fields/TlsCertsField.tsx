/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { useController } from 'react-hook-form'

import { Button, Error16Icon, FieldLabel, MiniTable, Modal } from '@oxide/ui'
import { capitalize } from '@oxide/util'

import {
  DescriptionField,
  FileField,
  TextField,
  type TextFieldProps,
} from 'app/components/form'
import type { SiloCreateInput } from 'app/forms/silo-create'
import { useForm } from 'app/hooks'

export function TlsCertsField({ control }: { control: Control<SiloCreateInput> }) {
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
                  <MiniTable.Cell>
                    <button
                      onClick={() => onChange(items.filter((i) => i.name !== item.name))}
                    >
                      <Error16Icon title={`remove ${item.name}`} />
                    </button>
                  </MiniTable.Cell>
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
              cert: await values.cert.text(),
              key: await values.key.text(),
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

export type TlsCertificate = Omit<
  SiloCreateInput['tlsCertificates'][number],
  'key' | 'cert'
> & {
  key: File
  cert: File
}

const defaultValues: Partial<TlsCertificate> = {
  description: '',
  name: '',
  service: 'external_api',
}

function UniqueNameField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  required = true,
  name,
  label = capitalize(name),
  allNames,
  ...textFieldProps
}: Omit<TextFieldProps<TFieldValues, TName>, 'validate'> & {
  label?: string
  allNames: string[]
}) {
  return (
    <TextField
      validate={(name) =>
        allNames.includes(name) ? 'Certificate with this name already exists' : true
      }
      required={required}
      label={label}
      name={name}
      {...textFieldProps}
    />
  )
}

const AddCertModal = ({
  onDismiss,
  onSubmit,
  allNames,
}: {
  onDismiss: () => void
  onSubmit: (values: TlsCertificate) => void
  allNames: string[]
}) => {
  const { control, handleSubmit } = useForm<TlsCertificate>({ defaultValues })

  return (
    <Modal isOpen onDismiss={onDismiss} title="Add TLS certificate">
      <Modal.Body>
        <form
          autoComplete="off"
          onSubmit={(e) => {
            e.stopPropagation()
            handleSubmit(onSubmit)(e)
          }}
        >
          <Modal.Section>
            <UniqueNameField name="name" control={control} allNames={allNames} />
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
