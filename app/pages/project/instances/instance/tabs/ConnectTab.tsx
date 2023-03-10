import { SettingsGroup } from '@oxide/ui'

import { useInstanceSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

export function ConnectTab() {
  const { organization, project, instance } = useInstanceSelector()

  return (
    <SettingsGroup
      title="Serial Console"
      docs={{ text: 'Serial Console', link: '/' }}
      cta={pb.serialConsole({ organization, project, instance })}
      ctaText="Connect"
    >
      Connect to your instance&rsquo;s serial console
    </SettingsGroup>
  )
}
