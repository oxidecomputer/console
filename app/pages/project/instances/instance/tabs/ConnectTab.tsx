import { SettingsGroup } from '@oxide/ui'

import { useInstanceSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

export function ConnectTab() {
  const { project, instance } = useInstanceSelector()

  return (
    <SettingsGroup
      title="Serial Console"
      docs={{ text: 'Serial Console', link: '/' }}
      cta={pb.serialConsole({ project, instance })}
      ctaText="Connect"
    >
      Connect to your instance&rsquo;s serial console
    </SettingsGroup>
  )
}
