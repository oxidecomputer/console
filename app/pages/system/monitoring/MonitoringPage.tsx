/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Link } from 'react-router-dom'

import { EquivalentCliCommand } from '~/components/EquivalentCliCommand'
import { buttonStyle } from '~/ui/lib/Button'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { SettingsGroup } from '~/ui/lib/SettingsGroup'
import { Monitoring24Icon } from 'app/components/monitoring/Icons'
import { RouteTabs, Tab } from 'app/components/RouteTabs'
import { pb } from 'app/util/path-builder'

export function SystemMonitoringPage() {
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Monitoring24Icon />}>Monitoring</PageTitle>
      </PageHeader>
      <RouteTabs fullWidth>
        <Tab to={pb.systemMonitoringSensorTree()}>Sensor Tree</Tab>
        <Tab to={pb.systemMonitoringExplore()}>Explorer</Tab>
      </RouteTabs>
    </>
  )
}

export const SensorTreeTab = () => {
  return <>SensorTreeTab</>
}

export function ExplorerTab() {
  return (
    <SettingsGroup.Container>
      <SettingsGroup.Body>
        <SettingsGroup.Title>Explorer</SettingsGroup.Title>
        Enter the rack 3D sensor explorer
      </SettingsGroup.Body>
      <SettingsGroup.Footer>
        <EquivalentCliCommand command={'oxide'} />
        <Link to={pb.systemMonitoringExplorer()} className={buttonStyle({ size: 'sm' })}>
          Connect
        </Link>
      </SettingsGroup.Footer>
    </SettingsGroup.Container>
  )
}
