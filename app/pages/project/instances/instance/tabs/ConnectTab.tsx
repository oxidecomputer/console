import { SettingsGroup } from '@oxide/ui'

import { useInstanceSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

export function ConnectTab() {
  const { organization, project, instance } = useInstanceSelector()

  return (
    <SettingsGroup
      title="Serial Console"
      docs={{ text: 'Serial Console', link: '/' }}
      cta={{ link: pb.serialConsole({ organization, project, instance }), text: 'Connect' }}
    >
      Connect to your instance’s serial console
    </SettingsGroup>
  )
}
