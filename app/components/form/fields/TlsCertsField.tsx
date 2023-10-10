/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import type { Control } from 'react-hook-form'
import { useController } from 'react-hook-form'

import { Button, Error16Icon, FieldLabel, MiniTable, Modal } from '@oxide/ui'

import { DescriptionField, FileField, NameField } from 'app/components/form'
import type { SiloCreateInput } from 'app/forms/silo-create'
import { useForm } from 'app/hooks'
import { readBlobAsText } from 'app/util/file'

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
            const keypair = {
              cert: await readBlobAsText(values.cert),
              key: await readBlobAsText(values.key),
            }
            onChange([...items, { ...values, ...keypair }])
            setShowAddCert(false)
          }}
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

const AddCertModal = ({
  onDismiss,
  onSubmit,
}: {
  onDismiss: () => void
  onSubmit: (values: TlsCertificate) => void
}) => {
  const { control, handleSubmit } = useForm<TlsCertificate>({ defaultValues })

  return (
    <Modal isOpen onDismiss={onDismiss} title="Add TLS Certificate">
      <Modal.Body>
        <form
          autoComplete="off"
          onSubmit={(e) => {
            e.stopPropagation()
            handleSubmit(onSubmit)(e)
          }}
        >
          <Modal.Section>
            <NameField name="name" control={control} />
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
