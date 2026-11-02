/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  index,
  layout,
  route,
  type RouteConfig,
  type RouteConfigEntry,
} from '@react-router/dev/routes'

// Breadcrumb-only modules (e.g. routes/silos.tsx) preserve matched parent routes
// and their handle.crumb values. Framework route config doesn't carry inline
// handles into the client; prefix() would remove the parent match entirely.
// Sharing empty.tsx would need a separate crumb registry keyed by route ID, or
// generated modules. Keep module handles so useCrumbs and route HMR work normally.
// https://reactrouter.com/start/framework/routing

// Each use needs its own ID because the framework normally derives it from the file.
function empty(path?: string, children?: RouteConfigEntry[]) {
  const options = { id: `empty/${path ?? 'index'}` }
  return path === undefined
    ? index('routes/empty.tsx', options)
    : route(path, 'routes/empty.tsx', options, children)
}

export default [
  layout('layouts/RootLayout.tsx', [
    route('*', 'routes/not-found.tsx'),
    layout('layouts/LoginLayout.tsx', [
      route('login/:silo/local', 'pages/LoginPage.tsx'),
      route('login/:silo/saml/:provider', 'pages/LoginPageSaml.tsx'),
    ]),
    route('device', 'layouts/AuthLayout.tsx', [
      route('verify', 'pages/DeviceAuthVerifyPage.tsx'),
      route('success', 'pages/DeviceAuthSuccessPage.tsx'),
    ]),
    layout('layouts/AuthenticatedLayout.tsx', [
      route('settings', 'layouts/SettingsLayout.tsx', [
        index('routes/settings-index.tsx'),
        route('profile', 'pages/settings/ProfilePage.tsx'),
        layout('pages/settings/SSHKeysPage.tsx', [
          empty('ssh-keys', [route(':sshKey/edit', 'forms/ssh-key-edit.tsx')]),
          route('ssh-keys-new', 'pages/settings/ssh-key-create.tsx'),
        ]),
        route('access-tokens', 'pages/settings/AccessTokensPage.tsx'),
      ]),
      route('system', 'layouts/SystemLayout.tsx', [
        layout('pages/system/silos/SilosPage.tsx', [
          empty('silos'),
          route('silos-new', 'forms/silo-create.tsx'),
        ]),
        route('silos', 'routes/silos.tsx', [
          route(':silo', 'pages/system/silos/SiloPage.tsx', [
            index('routes/silo-index.tsx'),
            layout('pages/system/silos/SiloIdpsTab.tsx', [
              empty('idps'),
              route('idps-new', 'forms/idp/create.tsx'),
              route('idps/saml/:provider', 'forms/idp/edit.tsx'),
            ]),
            route('ip-pools', 'pages/system/silos/SiloIpPoolsTab.tsx'),
            route('subnet-pools', 'pages/system/silos/SiloSubnetPoolsTab.tsx'),
            route('quotas', 'pages/system/silos/SiloQuotasTab.tsx'),
            route('fleet-roles', 'pages/system/silos/SiloFleetRolesTab.tsx'),
            route('scim', 'pages/system/silos/SiloScimTab.tsx'),
          ]),
        ]),
        empty('issues'),
        route('utilization', 'pages/system/UtilizationPage.tsx'),
        route('metrics-explorer', 'pages/system/MetricsExplorer.tsx'),
        route('inventory', 'pages/system/inventory/InventoryPage.tsx', [
          index('routes/inventory-index.tsx'),
          route('sleds', 'pages/system/inventory/SledsTab.tsx'),
          route('disks', 'pages/system/inventory/DisksTab.tsx'),
        ]),
        route('inventory', 'routes/inventory.tsx', [
          route('sleds', 'routes/sleds.tsx', [
            route(':sledId', 'pages/system/inventory/sled/SledPage.tsx', [
              index('routes/sled-index.tsx'),
              route('instances', 'pages/system/inventory/sled/SledInstancesTab.tsx'),
            ]),
          ]),
        ]),
        empty('networking', [
          index('routes/networking-index.tsx'),
          layout('pages/system/networking/IpPoolsPage.tsx', [
            empty('ip-pools'),
            route('ip-pools-new', 'forms/ip-pool-create.tsx'),
          ]),
          layout('pages/system/networking/SubnetPoolsPage.tsx', [
            empty('subnet-pools'),
            route('subnet-pools-new', 'forms/subnet-pool-create.tsx'),
          ]),
        ]),
        route('networking/ip-pools', 'routes/ip-pools.tsx', [
          route(':pool', 'pages/system/networking/IpPoolPage.tsx', [
            route('edit', 'forms/ip-pool-edit.tsx'),
            route('ranges-add', 'forms/ip-pool-range-add.tsx'),
          ]),
        ]),
        route('networking/subnet-pools', 'routes/subnet-pools.tsx', [
          route(':subnetPool', 'pages/system/networking/SubnetPoolPage.tsx', [
            route('edit', 'forms/subnet-pool-edit.tsx'),
            route('members-add', 'forms/subnet-pool-member-add.tsx'),
          ]),
        ]),
        route('alerting', 'pages/system/alerting/AlertingPage.tsx', [
          index('routes/alerting-index.tsx'),
          layout('pages/system/alerting/AlertReceiversTab.tsx', [empty('receivers')]),
          route('alerts', 'pages/system/alerting/AlertsTab.tsx'),
        ]),
        route('alerting', 'routes/alerting.tsx', [
          route('receivers', 'routes/alert-receivers.tsx', [
            route(':receiver', 'pages/system/alerting/AlertReceiverPage.tsx', [
              route('edit', 'forms/webhook-edit.tsx'),
            ]),
          ]),
          layout('routes/alert-receivers-create.tsx', [
            route('receivers-new', 'forms/webhook-create.tsx'),
          ]),
        ]),
        route('update', 'pages/system/UpdatePage.tsx'),
        layout('pages/system/SupportBundlesPage.tsx', [
          empty('support-bundles', [
            route(':bundleId', 'pages/system/SupportBundleDetail.tsx'),
          ]),
          route('support-bundles-new', 'forms/support-bundle-create.tsx'),
        ]),
        route('access', 'pages/system/FleetAccessPage.tsx'),
        route('audit-log', 'pages/system/AuditLog.tsx'),
      ]),
      index('routes/index.tsx'),
      layout('layouts/SiloLayout.tsx', [
        route('images', 'pages/SiloImagesPage.tsx', [
          route(':image', 'pages/SiloImageDetail.tsx'),
          route(':image/edit', 'routes/drop-edit-redirect.tsx'),
        ]),
        route('utilization', 'pages/SiloUtilizationPage.tsx'),
        route('lookup/instances/:instance', 'pages/InstanceLookup.tsx'),
        route('lookup/i/:instance', 'pages/InstanceLookup.tsx', {
          id: 'lookup/i/instance',
        }),
        layout('pages/ProjectsPage.tsx', [
          empty('projects'),
          route('projects-new', 'forms/project-create.tsx'),
          route('projects/:project/edit', 'forms/project-edit.tsx'),
        ]),
        route('access', 'pages/SiloAccessPage.tsx'),
      ]),
      route('projects', 'routes/projects.tsx', [
        route(':project', 'layouts/SerialConsoleLayout.tsx', [
          route('instances', 'routes/instances.tsx', [
            route(':instance', 'routes/instance.tsx', [
              route('serial-console', 'pages/project/instances/SerialConsolePage.tsx'),
            ]),
          ]),
        ]),
        route(':project', 'layouts/ProjectLayout.tsx', [
          index('routes/project-index.tsx'),
          route('instances-new', 'forms/instance-create.tsx'),
          route('instances', 'routes/instances.tsx', { id: 'projects/project/instances' }, [
            index('pages/project/instances/InstancesPage.tsx'),
            route(
              ':instance',
              'routes/instance.tsx',
              { id: 'projects/project/instances/instance' },
              [
                index('routes/instance-index.tsx'),
                layout('pages/project/instances/InstancePage.tsx', [
                  route('storage', 'pages/project/instances/StorageTab.tsx'),
                  route('networking', 'pages/project/instances/NetworkingTab.tsx'),
                  route('metrics', 'pages/project/instances/MetricsTab.tsx', [
                    index('routes/instance-metrics-index.tsx'),
                    route('cpu', 'pages/project/instances/CpuMetricsTab.tsx'),
                    route('disk', 'pages/project/instances/DiskMetricsTab.tsx'),
                    route('network', 'pages/project/instances/NetworkMetricsTab.tsx'),
                  ]),
                  route('connect', 'pages/project/instances/ConnectTab.tsx'),
                  route('settings', 'pages/project/instances/SettingsTab.tsx'),
                ]),
              ]
            ),
          ]),
          layout('pages/project/vpcs/VpcsPage.tsx', [
            empty('vpcs'),
            route('vpcs-new', 'forms/vpc-create.tsx'),
          ]),
          route('vpcs', 'routes/vpcs.tsx', [
            route(':vpc', 'routes/vpc.tsx', [
              layout('pages/project/vpcs/VpcPage.tsx', [
                index('routes/vpc-index.tsx'),
                layout('pages/project/vpcs/VpcFirewallRulesTab.tsx', [
                  route('edit', 'forms/vpc-edit.tsx'),
                  route('firewall-rules', 'routes/firewall-rules.tsx'),
                  layout('routes/firewall-rules-link.tsx', [
                    route('firewall-rules-new/:rule?', 'forms/firewall-rules-create.tsx'),
                    route('firewall-rules/:rule/edit', 'forms/firewall-rules-edit.tsx'),
                  ]),
                ]),
                layout('pages/project/vpcs/VpcSubnetsTab.tsx', [
                  empty('subnets'),
                  route('subnets-new', 'forms/subnet-create.tsx'),
                  route('subnets/:subnet/edit', 'forms/subnet-edit.tsx'),
                ]),
                layout('pages/project/vpcs/VpcRoutersTab.tsx', [
                  empty('routers', [route(':router/edit', 'forms/vpc-router-edit.tsx')]),
                  route('routers-new', 'forms/vpc-router-create.tsx'),
                ]),
                route('internet-gateways', 'pages/project/vpcs/VpcGatewaysTab.tsx', [
                  route(':gateway', 'pages/project/vpcs/internet-gateway-edit.tsx'),
                ]),
              ]),
            ]),
          ]),
          route('vpcs', 'routes/vpcs.tsx', { id: 'projects/project/vpcs-2' }, [
            route(':vpc', 'routes/vpc.tsx', { id: 'projects/project/vpcs/vpc' }, [
              route('routers', 'routes/routers.tsx', [
                route(':router', 'pages/project/vpcs/RouterPage.tsx', [
                  layout('routes/vpc-router-routes.tsx', [
                    empty(),
                    route('routes-new', 'forms/vpc-router-route-create.tsx'),
                    route('routes/:route/edit', 'forms/vpc-router-route-edit.tsx'),
                  ]),
                ]),
              ]),
            ]),
          ]),
          layout('pages/project/external-subnets/ExternalSubnetsPage.tsx', [
            empty('external-subnets'),
            route('external-subnets-new', 'forms/external-subnet-create.tsx'),
            route(
              'external-subnets/:externalSubnet/edit',
              'forms/external-subnet-edit.tsx'
            ),
          ]),
          layout('pages/project/floating-ips/FloatingIpsPage.tsx', [
            empty('floating-ips'),
            route('floating-ips-new', 'forms/floating-ip-create.tsx'),
            route('floating-ips/:floatingIp/edit', 'forms/floating-ip-edit.tsx'),
          ]),
          layout('pages/project/disks/DisksPage.tsx', [
            empty('disks'),
            route('disks-new', 'pages/project/disks/DiskCreate.tsx'),
            route('disks/:disk', 'pages/project/disks/DiskDetailSideModal.tsx'),
          ]),
          layout('pages/project/snapshots/SnapshotsPage.tsx', [
            empty('snapshots'),
            route('snapshots-new', 'forms/snapshot-create.tsx'),
            route('snapshots/:snapshot/images-new', 'forms/image-from-snapshot.tsx'),
          ]),
          layout('pages/project/images/ImagesPage.tsx', [
            empty('images'),
            route('images-new', 'forms/image-upload.tsx'),
            route('images/:image', 'pages/project/images/ProjectImageDetail.tsx'),
            route('images/:image/edit', 'routes/drop-edit-redirect.tsx', {
              id: 'projects/project/images/image/edit',
            }),
          ]),
          route('access', 'pages/project/access/ProjectAccessPage.tsx'),
          layout('routes/affinity-create.tsx', [
            route('affinity-new', 'forms/anti-affinity-group-create.tsx'),
          ]),
          route('affinity', 'routes/affinity-link.tsx', [
            index('pages/project/affinity/AffinityPage.tsx'),
            route(
              ':antiAffinityGroup',
              'pages/project/affinity/AntiAffinityGroupPage.tsx',
              [route('edit', 'forms/anti-affinity-group-edit.tsx')]
            ),
          ]),
        ]),
      ]),
    ]),
  ]),
] satisfies RouteConfig
