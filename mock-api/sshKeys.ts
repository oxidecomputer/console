/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { SshKey } from '@oxide/api'

import type { Json } from './json-type'
import { user1 } from './user'

export const sshKeys: Json<SshKey>[] = [
  {
    id: '43af8bc5-6f8e-404d-8b39-72b07cc9da56',
    name: 'm1-macbook-pro',
    description: 'For use on personal projects',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    public_key:
      'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDU3w4FaSj/tEZYaoBtzijAFZanW9MakaPhSERtdC75opT6F/bs4ZXE8sjWgqDM1azoZbUKa42b4RWPPtCgqGQkbyYDZTzdssrml3/T1Avcy5GKlfTjACRHSI6PhC6r6bM1jxPUUstH7fBbw+DTHywUpdkvz7SHxTEOyZuP2sn38V9vBakYVsLFOu7C1W0+Jm4TYCRJlcsuC5LHVMVc4WbWzBcAZZlAznWx0XajMxmkyCB5tsyhTpykabfHbih4F3bwHYKXO613JZ6DurGcPz6CPkAVS5BWG6GrdBCkd+YK8Lw8k1oAAZLYIKQZbMnPJSNxirJ8+vr+iyIwP1DjBMnJ hannah@m1-macbook-pro.local',
    silo_user_id: user1.id,
  },
  {
    id: 'b2c3d4e5-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
    name: 'mac-mini',
    description: '',
    time_created: new Date().toISOString(),
    time_modified: new Date().toISOString(),
    public_key:
      'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDVav/u9wm2ALv4ks18twWQB0LHlJ1Q1y7HTi91SUuv4H95EEwqj6tVDSOtHQi08PG7xp6/8gaMVC9rs1jKl7o0cy32kuWp/rXtryn3d1bEaY9wOGwR6iokx0zjocHILhrjHpAmWnXP8oWvzx8TWOg3VPhBkZsyNdqzcdxYP2UsqccaNyz5kcuNhOYbGjIskNPAk1drsHnyKvqoEVix8UzVkLHC6vVbcVjQGTaeUif29xvUN3W5QMGb/E1L66RPN3ovaDyDylgA8az8q56vrn4jSY5Mx3ANQEvjxl//Hnq31dpoDFiEvHyB4bbq8bSpypa2TyvheobmLnsnIaXEMHFT hannah@mac-mini.local',
    silo_user_id: user1.id,
  },
]
