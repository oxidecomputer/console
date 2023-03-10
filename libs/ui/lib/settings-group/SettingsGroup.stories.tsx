import { SettingsGroup } from './SettingsGroup'

export const Default = () => (
  <SettingsGroup
    title="Serial Console"
    docs={{ text: 'Serial Console', link: '/' }}
    cta={{ link: '/', text: 'Connect' }}
  >
    Connect to your instance’s serial console
  </SettingsGroup>
)
