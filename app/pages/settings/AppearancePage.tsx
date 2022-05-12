import { RadioCard } from '@oxide/ui'
import type { Mutation } from 'app/components/form'
import { Form, RadioField } from 'app/components/form'

const manualMutation: Mutation = {
  status: 'idle',
  data: undefined,
  error: null,
}

export function AppearancePage() {
  return (
    <Form
      id="appearance-form"
      title="Appearance"
      initialValues={{ theme: 'dark' }}
      onSubmit={() => {}}
      mutation={manualMutation}
    >
      <RadioField id="theme-select" name="theme" label="Theme mode">
        <RadioCard value="dark">
          <div className="flex flex-col space-y-2">
            <svg
              width="237"
              height="137"
              viewBox="0 0 237 137"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="237" height="137" rx="1" fill="#080F11" />
              <line x1="45.5" y1="-2.18557e-08" x2="45.5" y2="138" stroke="#1C2325" />
              <rect x="60" y="16" width="59" height="6" rx="1" fill="#2E8160" />
              <rect x="60" y="37" width="161" height="12" rx="1" fill="#102422" />
              <rect x="108" y="77" width="113" height="12" rx="1" fill="#1C2325" />
              <rect x="108" y="61" width="113" height="12" rx="1" fill="#1C2325" />
              <rect x="108" y="93" width="113" height="12" rx="1" fill="#1C2325" />
            </svg>
            <span>Default (Dark)</span>
          </div>
        </RadioCard>
        <RadioCard value="light">
          <div className="flex flex-col space-y-2">
            <svg
              width="237"
              height="137"
              viewBox="0 0 237 137"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="237" height="137" rx="1" fill="#DBDBDC" />
              <rect x="60" y="16" width="59" height="6" rx="1" fill="#141A1C" />
              <rect
                opacity="0.6"
                x="60"
                y="37"
                width="161"
                height="12"
                rx="1"
                fill="#48D597"
              />
              <rect x="108" y="77" width="113" height="12" rx="1" fill="#AEB0B2" />
              <rect x="108" y="61" width="113" height="12" rx="1" fill="#AEB0B2" />
              <rect x="108" y="93" width="113" height="12" rx="1" fill="#AEB0B2" />
              <rect x="60" y="61" width="32" height="32" rx="1" fill="#AEB0B2" />
              <line x1="45.5" y1="2.18557e-08" x2="45.5" y2="137" stroke="#AEB0B2" />
            </svg>
            <span>Light</span>
          </div>
        </RadioCard>
      </RadioField>

      <Form.Actions>
        <Form.Submit>Save</Form.Submit>
      </Form.Actions>
    </Form>
  )
}
