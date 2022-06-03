import { PageHeader, PageTitle, Radio, RadioCard } from '@oxide/ui'
import type { FormMutation } from 'app/components/form'
import { Form, RadioField } from 'app/components/form'
import { DarkTheme, LightTheme } from 'app/components/ThemeIcons'

const manualMutation: FormMutation = {
  status: 'error',
  data: undefined,
  error: {
    // @ts-expect-error Just let folks know this doesn't work yet
    error: new Error('This form is not yet implemented'),
  },
}

export function AppearancePage() {
  return (
    <>
      <PageHeader>
        <PageTitle>Appearance</PageTitle>
      </PageHeader>
      <Form
        id="appearance-form"
        title="Appearance"
        initialValues={{ theme: 'dark', contrast: 'default', reducedMotion: 'system' }}
        onSubmit={() => {}}
        mutation={manualMutation}
      >
        <RadioField id="theme-select" name="theme" label="Theme mode">
          <RadioCard value="dark">
            <div className="flex flex-col space-y-2">
              <DarkTheme />
              <span>Default (Dark)</span>
            </div>
          </RadioCard>
          <RadioCard value="light">
            <div className="flex flex-col space-y-2">
              <LightTheme />
              <span>Light</span>
            </div>
          </RadioCard>
        </RadioField>

        <RadioField id="contrast-select" name="contrast" label="Theme Contrast" column>
          <Radio value="default">Default</Radio>
          <Radio value="high">High Contrast</Radio>
        </RadioField>

        <RadioField
          id="reduced-motion-select"
          name="reducedMotion"
          label="Reduced Motion"
          column
        >
          <Radio value="system">Use system settings</Radio>
          <Radio value="enabled">Enabled</Radio>
          <Radio value="disabled">Disabled</Radio>
        </RadioField>

        <Form.Actions>
          <Form.Submit disabled>Save</Form.Submit>
        </Form.Actions>
      </Form>
    </>
  )
}
