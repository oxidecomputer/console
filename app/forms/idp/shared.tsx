/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useController, type Control } from 'react-hook-form'
import type { Merge } from 'type-fest'

import type { IdpMetadataSource, SamlIdentityProviderCreate } from '@oxide/api'
import { Radio, RadioGroup } from '@oxide/ui'

import { FileField } from '~/components/form/fields/FileField'
import { TextField } from '~/components/form/fields/TextField'

export type IdpCreateFormValues = { type: 'saml' } & Merge<
  SamlIdentityProviderCreate,
  {
    idpMetadataSourceFile?: File | null
    signingKeypair: {
      publicCert: File | null
      privateKey: File | null
    }
  }
>

/**
 * Control the `idpMetadataSource` field, which can either be a URL or
 * Base64-encoded XML. It's only for clarity that this is a separate component.
 * It could be done just as well inline with `watch` and `setValue`.
 */
export function MetadataSourceField({
  control,
}: {
  control: Control<IdpCreateFormValues>
}) {
  const {
    field: { value, onChange },
  } = useController({ control, name: 'idpMetadataSource' })
  return (
    <fieldset>
      <legend id="metadata-source-legend" className="mb-2 text-sans-md">
        Metadata source
      </legend>
      {/* TODO: probably need some help text here */}
      <RadioGroup
        className="mb-7"
        name="metadata_source_type"
        defaultChecked="url"
        onChange={(e) => {
          const newValue: IdpMetadataSource =
            e.target.value === 'url'
              ? { type: 'url', url: '' }
              : { type: 'base64_encoded_xml', data: '' }
          onChange(newValue)
        }}
      >
        <Radio value="url">URL</Radio>
        <Radio value="base64_encoded_xml">XML</Radio>
      </RadioGroup>
      {/* TODO: preserve whatever was in the input in local state
          when the type changes */}
      {value.type === 'url' && (
        <TextField
          name="idpMetadataSource.url"
          label="Metadata source URL"
          required
          control={control}
        />
      )}
      {value.type === 'base64_encoded_xml' && (
        <FileField
          id="idp-metadata-source-file-input"
          name="idpMetadataSourceFile"
          label="Metadata source XML"
          required
          control={control}
        />
      )}
    </fieldset>
  )
}
