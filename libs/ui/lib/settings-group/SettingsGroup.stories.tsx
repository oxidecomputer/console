import { SettingsGroup } from './SettingsGroup'

export const Default = () => (
  <SettingsGroup
    title="Serial Console"
    docs={{ text: 'Serial Console', link: '/' }}
    cta="/"
    ctaText="Connect"
  >
    Connect to your instance&rsquo;s serial console
  </SettingsGroup>
)

export const WithoutDocs = () => (
  <SettingsGroup title="Serial Console" cta="/" ctaText="Connect">
    Connect to your instance&rsquo;s serial console
  </SettingsGroup>
)

export const FunctionAction = () => (
  <SettingsGroup title="Serial Console" cta={() => alert('hi')} ctaText="Connect">
    Connect to your instance&rsquo;s serial console
  </SettingsGroup>
)
