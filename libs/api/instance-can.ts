import type { InstanceView } from './__generated__'

export const instanceCan: Record<string, (i: InstanceView) => boolean> = {
  reboot: (i) => i.runState === 'running',
  stop: (i) => i.runState === 'running',
  delete: (i) => i.runState === 'stopped',
}
