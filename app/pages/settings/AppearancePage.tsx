import { Radio, RadioCard, Settings24Icon } from '@oxide/ui'
import { FullPageForm } from 'app/components/form'
import { Form, RadioField } from 'app/components/form'
import { DarkTheme, LightTheme } from 'app/components/ThemeIcons'

export function AppearancePage() {
  return (
    <>
      <FullPageForm
        id="appearance-form"
        title="Appearance"
        initialValues={{ theme: 'dark', contrast: 'default', reducedMotion: 'system' }}
        onSubmit={() => {}}
        icon={<Settings24Icon />}
        error={new Error('This form is not yet implemented')}
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

        <Form.Submit disabled>Save</Form.Submit>
      </FullPageForm>
    </>
  )
}
