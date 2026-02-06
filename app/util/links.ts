/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

const remoteAccess = 'https://docs.oxide.computer/guides/remote-access'

// URLs used in inline prose links where the label is chosen to fit the
// surrounding sentence. For links with a canonical label, use docLinks instead.
export const links = {
  cloudInitFormat: 'https://cloudinit.readthedocs.io/en/latest/explanation/format.html',
  cloudInitExamples: 'https://cloudinit.readthedocs.io/en/latest/reference/examples.html',
  firewallRulesDocs:
    'https://docs.oxide.computer/guides/configuring-guest-networking#_firewall_rules',
  preparingImagesDocs:
    'https://docs.oxide.computer/guides/creating-and-sharing-images#_preparing_images_for_import',
  identityProvidersDocs: 'https://docs.oxide.computer/guides/operator/identity-providers',
  // TODO: link to section
  instanceBootDiskDocs: 'https://docs.oxide.computer/guides/deploying-workloads',
  instanceUpdateDocs:
    'https://docs.oxide.computer/guides/managing-instances#_update_instances',
  oxqlDocs: 'https://docs.oxide.computer/guides/operator/system-metrics#_oxql_quickstart',
  oxqlSchemaDocs: (metric: string) =>
    `https://docs.oxide.computer/guides/metrics/timeseries-schemas#_${metric.replace(':', '')}`,
  scimDocs:
    'https://docs.oxide.computer/guides/operator/identity-providers#_saml_authentication_scim_user_provisioning',
  siloQuotasDocs:
    'https://docs.oxide.computer/guides/operator/silo-management#_silo_resource_quota_management',
  serialConsoleDocs: remoteAccess + '#serial-console',
  sshDocs: remoteAccess + '#ssh',
  transitIpsDocs:
    'https://docs.oxide.computer/guides/configuring-guest-networking#_example_4_software_routing_tunnels',
  troubleshootingAccess:
    'https://docs.oxide.computer/guides/operator/faq#_how_do_i_fix_the_something_went_wrong_error',
}

// Links with a canonical label, used in DocsPopover and SideModalFormDocs.
export const docLinks = {
  access: {
    href: 'https://docs.oxide.computer/guides/configuring-access',
    linkText: 'Access Control',
  },
  affinity: {
    href: 'https://docs.oxide.computer/guides/deploying-workloads#_affinity_and_anti_affinity',
    linkText: 'Anti-Affinity Groups',
  },
  deviceTokens: {
    href: 'https://docs.oxide.computer/guides/working-with-api-and-sdk#_device_token_setup',
    linkText: 'Access Tokens',
  },
  disks: {
    href: 'https://docs.oxide.computer/guides/managing-disks-and-snapshots',
    linkText: 'Disks and Snapshots',
  },
  firewallRules: {
    href: links.firewallRulesDocs,
    linkText: 'Firewall Rules',
  },
  floatingIps: {
    href: 'https://docs.oxide.computer/guides/managing-floating-ips',
    linkText: 'Floating IPs',
  },
  gateways: {
    href: 'https://docs.oxide.computer/guides/configuring-guest-networking#internet-gateway',
    linkText: 'Internet Gateways',
  },
  keyConceptsIam: {
    href: 'https://docs.oxide.computer/guides/key-entities-and-concepts#iam-policy',
    linkText: 'Key Concepts',
  },
  identityProviders: {
    href: links.identityProvidersDocs,
    linkText: 'Identity Providers',
  },
  images: {
    href: 'https://docs.oxide.computer/guides/creating-and-sharing-images',
    linkText: 'Images',
  },
  instanceActions: {
    href: 'https://docs.oxide.computer/guides/managing-instances',
    linkText: 'Instance Actions',
  },
  keyConceptsProjects: {
    href: 'https://docs.oxide.computer/guides/key-entities-and-concepts#_projects',
    linkText: 'Key Concepts',
  },
  projects: {
    href: 'https://docs.oxide.computer/guides/onboarding-projects',
    linkText: 'Projects',
  },
  quickStart: {
    href: 'https://docs.oxide.computer/guides/quickstart',
    linkText: 'Quick Start',
  },
  remoteAccess: {
    href: remoteAccess,
    linkText: 'Remote Access',
  },
  routers: {
    href: 'https://docs.oxide.computer/guides/configuring-guest-networking#_custom_routers',
    linkText: 'Custom Routers',
  },
  routes: {
    href: 'https://docs.oxide.computer/guides/configuring-guest-networking#vpc-subnet',
    linkText: 'VPC Subnet Routing',
  },
  sleds: {
    href: 'https://docs.oxide.computer/guides/architecture/service-processors#_server_sled',
    linkText: 'Server Sleds',
  },
  snapshots: {
    href: 'https://docs.oxide.computer/guides/managing-disks-and-snapshots#_snapshots',
    linkText: 'Disks and Snapshots',
  },
  sshKeys: {
    href: 'https://docs.oxide.computer/guides/user-settings#_ssh_keys',
    linkText: 'SSH Keys',
  },
  storage: {
    href: 'https://docs.oxide.computer/guides/architecture/os-hypervisor-storage#_storage',
    linkText: 'Storage',
  },
  systemIpPools: {
    href: 'https://docs.oxide.computer/guides/operator/ip-pool-management',
    linkText: 'IP Pools',
  },
  systemMetrics: {
    href: 'https://docs.oxide.computer/guides/operator/system-metrics',
    linkText: 'Metrics',
  },
  systemSilo: {
    href: 'https://docs.oxide.computer/guides/operator/silo-management',
    linkText: 'Silos',
  },
  systemUpdate: {
    href: 'https://docs.oxide.computer/guides/operator/system-update',
    linkText: 'System Update',
  },
  instances: {
    href: 'https://docs.oxide.computer/guides/deploying-workloads',
    linkText: 'Instances',
  },
  vpcs: {
    href: 'https://docs.oxide.computer/guides/configuring-guest-networking',
    linkText: 'Networking',
  },
}
