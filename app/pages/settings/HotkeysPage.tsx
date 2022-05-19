import type { FormMutation } from 'app/components/form'
import { Radio, RadioField } from 'app/components/form'
import { ListboxField } from 'app/components/form'
import { Form } from 'app/components/form'

const Meta = navigator.userAgent.match(/Mac/i) ? '⌘' : 'Ctrl'

const manualMutation: FormMutation = {
  status: 'idle',
  data: undefined,
  error: null,
}

export function HotkeysPage() {
  return (
    <Form
      id="profile-form"
      title="Profile"
      initialValues={{
        actionMenuHotkey: 'cmd+k',
        hotkeys: 'enabled',
      }}
      onSubmit={() => {}}
      mutation={manualMutation}
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
      <Form.Actions>
        <Form.Submit>Save</Form.Submit>
      </Form.Actions>
    </Form>
  )
}
