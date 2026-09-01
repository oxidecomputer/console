/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Notifications16Icon, Prohibited24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { makeCrumb } from '~/hooks/use-crumbs'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

export const handle = makeCrumb('Alerting', pb.alertReceivers())

export default function AlertingPage() {
  return (
    <>
      <PageHeader>
        {/* PLACEHOLDER — do not ship with Prohibited24Icon. Ben is
        going to add a notifications-24 icon to the design system. */}
        <PageTitle icon={<Prohibited24Icon />}>Alerting</PageTitle>
        <DocsPopover
          heading="alerting"
          icon={<Notifications16Icon />}
          summary="Alerts notify you when events occur in the system. Webhook receivers deliver them to endpoints you configure."
          links={[docLinks.alerts, docLinks.webhookReceivers]}
        />
      </PageHeader>

      <RouteTabs fullWidth>
        <Tab to={pb.alertReceivers()}>Receivers</Tab>
        <Tab to={pb.alerts()}>Alerts</Tab>
      </RouteTabs>
    </>
  )
}
