import { Settings24Icon } from '@oxide/ui'
import { FullPageForm, Radio, RadioField } from 'app/components/form'
import { ListboxField } from 'app/components/form'
import { Form } from 'app/components/form'

const Meta = navigator.userAgent.match(/Mac/i) ? '⌘' : 'Ctrl'

export function HotkeysPage() {
  return (
    <>
      <FullPageForm
        id="hotkeys-form"
        title="Hotkeys"
        initialValues={{
          actionMenuHotkey: 'cmd+k',
          hotkeys: 'enabled',
        }}
        onSubmit={() => {}}
        icon={<Settings24Icon />}
        error={new Error('This form is not yet implemented')}
      >
        <ListboxField
          id="action-menu-hotkey"
          name="actionMenuHotkey"
          required
          label="Action menu hotkey"
          // TODO: What are the options?
          items={[{ label: `${Meta} + K`, value: 'cmd+k' }]}
        />
        <RadioField id="hotkeys-enabled" name="hotkeys" label="Hotkeys" column>
          <Radio value="enabled">Enabled</Radio>
          <Radio value="disabled">Disabled</Radio>
        </RadioField>
        <Form.Submit>Save</Form.Submit>
      </FullPageForm>
    </>
  )
}
