import { type Control, useController } from 'react-hook-form'

import type { IdpMetadataSource, SamlIdentityProviderCreate } from '@oxide/api'
import { Radio, RadioGroup } from '@oxide/ui'

import { TextFieldInner } from 'app/components/form'

export type IdpCreateFormValues = { type: 'saml' } & SamlIdentityProviderCreate

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
      <legend id="metadata-source-legend" className="mb-4 text-sans-md">
        Metadata source
      </legend>
      {/* TODO: probably need some help text here */}
      <RadioGroup
        className="mb-4"
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
        <Radio value="base64_encoded_xml">Base64-encoded XML</Radio>
      </RadioGroup>
      {/* TODO: preserve whatever was in the input in local state
          when the type changes */}
      {value.type === 'url' && (
        <TextFieldInner
          name="idpMetadataSource.url"
          className="mb-8" // give it the same height as the textarea
          aria-labelledby="metadata-source-legend"
          control={control}
        />
      )}
      {value.type === 'base64_encoded_xml' && (
        <TextFieldInner
          name="idpMetadataSource.data"
          as="textarea"
          aria-labelledby="metadata-source-legend"
          control={control}
        />
      )}
    </fieldset>
  )
}
