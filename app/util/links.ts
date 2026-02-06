/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

const remoteAccess = 'https://docs.oxide.computer/guides/remote-access'

export const links = {
  accessDocs: 'https://docs.oxide.computer/guides/configuring-access',
  affinityDocs:
    'https://docs.oxide.computer/guides/deploying-workloads#_affinity_and_anti_affinity',
  cloudInitFormat: 'https://cloudinit.readthedocs.io/en/latest/explanation/format.html',
  cloudInitExamples: 'https://cloudinit.readthedocs.io/en/latest/reference/examples.html',
  deviceTokenSetup:
    'https://docs.oxide.computer/guides/working-with-api-and-sdk#_device_token_setup',
  disksDocs: 'https://docs.oxide.computer/guides/managing-disks-and-snapshots',
  firewallRulesDocs:
    'https://docs.oxide.computer/guides/configuring-guest-networking#_firewall_rules',
  floatingIpsDocs: 'https://docs.oxide.computer/guides/managing-floating-ips',
  gatewaysDocs:
    'https://docs.oxide.computer/guides/configuring-guest-networking#internet-gateway',
  imagesDocs: 'https://docs.oxide.computer/guides/creating-and-sharing-images',
  preparingImagesDocs:
    'https://docs.oxide.computer/guides/creating-and-sharing-images#_preparing_images_for_import',
  identityProvidersDocs: 'https://docs.oxide.computer/guides/operator/identity-providers',
  instanceActionsDocs: 'https://docs.oxide.computer/guides/managing-instances',
  // TODO: link to section
  instanceBootDiskDocs: 'https://docs.oxide.computer/guides/deploying-workloads',
  instanceUpdateDocs:
    'https://docs.oxide.computer/guides/managing-instances#_update_instances',
  ipPoolCreateDocs:
    'https://docs.oxide.computer/guides/operator/ip-pool-management#_create_ip_pools',
  ipPoolTypesDocs:
    'https://docs.oxide.computer/guides/operator/ip-pool-management#_ip_pool_types',
  keyConceptsIamPolicyDocs:
    'https://docs.oxide.computer/guides/key-entities-and-concepts#iam-policy',
  keyConceptsProjectsDocs:
    'https://docs.oxide.computer/guides/key-entities-and-concepts#_projects',
  oxqlDocs: 'https://docs.oxide.computer/guides/operator/system-metrics#_oxql_quickstart',
  oxqlSchemaDocs: (metric: string) =>
    `https://docs.oxide.computer/guides/metrics/timeseries-schemas#_${metric.replace(':', '')}`,
  projectsDocs: 'https://docs.oxide.computer/guides/onboarding-projects',
  quickStart: 'https://docs.oxide.computer/guides/quickstart',
  routesDocs: 'https://docs.oxide.computer/guides/configuring-guest-networking#vpc-subnet',
  routersDocs:
    'https://docs.oxide.computer/guides/configuring-guest-networking#_custom_routers',
  subnetsDocs:
    'https://docs.oxide.computer/guides/configuring-guest-networking#_vpcs_and_subnets',
  scimDocs:
    'https://docs.oxide.computer/guides/operator/identity-providers#_saml_authentication_scim_user_provisioning',
  siloQuotasDocs:
    'https://docs.oxide.computer/guides/operator/silo-management#_silo_resource_quota_management',
  sledDocs:
    'https://docs.oxide.computer/guides/architecture/service-processors#_server_sled',
  snapshotsDocs:
    'https://docs.oxide.computer/guides/managing-disks-and-snapshots#_snapshots',
  serialConsoleDocs: remoteAccess + '#serial-console',
  sshDocs: remoteAccess + '#ssh',
  sshKeysDocs: 'https://docs.oxide.computer/guides/user-settings#_ssh_keys',
  storageDocs:
    'https://docs.oxide.computer/guides/architecture/os-hypervisor-storage#_storage',
  systemIpPoolsDocs: 'https://docs.oxide.computer/guides/operator/ip-pool-management',
  systemMetricsDocs: 'https://docs.oxide.computer/guides/operator/system-metrics',
  systemSiloDocs: 'https://docs.oxide.computer/guides/operator/silo-management',
  systemUpdateDocs: 'https://docs.oxide.computer/guides/operator/system-update',
  transitIpsDocs:
    'https://docs.oxide.computer/guides/configuring-guest-networking#_example_4_software_routing_tunnels',
  troubleshootingAccess:
    'https://docs.oxide.computer/guides/operator/faq#_how_do_i_fix_the_something_went_wrong_error',
  instancesDocs: 'https://docs.oxide.computer/guides/deploying-workloads',
  vpcsDocs: 'https://docs.oxide.computer/guides/configuring-guest-networking',
}

// These are links (and associated titles) to help documentation
export const docLinks = {
  access: {
    href: links.accessDocs,
    linkText: 'Access Control',
  },
  affinity: {
    href: links.affinityDocs,
    linkText: 'Anti-Affinity Groups',
  },
  deviceTokens: {
    href: links.deviceTokenSetup,
    linkText: 'Access Tokens',
  },
  disks: {
    href: links.disksDocs,
    linkText: 'Disks and Snapshots',
  },
  firewallRules: {
    href: links.firewallRulesDocs,
    linkText: 'Firewall Rules',
  },
  floatingIps: {
    href: links.floatingIpsDocs,
    linkText: 'Floating IPs',
  },
  gateways: {
    href: links.gatewaysDocs,
    linkText: 'Internet Gateways',
  },
  keyConceptsIam: {
    href: links.keyConceptsIamPolicyDocs,
    linkText: 'Key Concepts',
  },
  identityProviders: {
    href: links.identityProvidersDocs,
    linkText: 'Identity Providers',
  },
  images: {
    href: links.imagesDocs,
    linkText: 'Images',
  },
  instanceActions: {
    href: links.instanceActionsDocs,
    linkText: 'Instance Actions',
  },
  keyConceptsProjects: {
    href: links.keyConceptsProjectsDocs,
    linkText: 'Key Concepts',
  },
  projects: {
    href: links.projectsDocs,
    linkText: 'Projects',
  },
  quickStart: {
    href: links.quickStart,
    linkText: 'Quick Start',
  },
  remoteAccess: {
    href: remoteAccess,
    linkText: 'Remote Access',
  },
  routers: {
    href: links.routersDocs,
    linkText: 'Custom Routers',
  },
  routes: {
    href: links.routesDocs,
    linkText: 'VPC Subnet Routing',
  },
  sleds: {
    href: links.sledDocs,
    linkText: 'Server Sleds',
  },
  snapshots: {
    href: links.snapshotsDocs,
    linkText: 'Disks and Snapshots',
  },
  sshKeys: {
    href: links.sshKeysDocs,
    linkText: 'SSH Keys',
  },
  subnets: {
    href: links.subnetsDocs,
    linkText: 'VPCs and Subnets',
  },
  storage: {
    href: links.storageDocs,
    linkText: 'Storage',
  },
  systemIpPools: {
    href: links.systemIpPoolsDocs,
    linkText: 'IP Pools',
  },
  systemMetrics: {
    href: links.systemMetricsDocs,
    linkText: 'Metrics',
  },
  systemSilo: {
    href: links.systemSiloDocs,
    linkText: 'Silos',
  },
  systemUpdate: {
    href: links.systemUpdateDocs,
    linkText: 'System Update',
  },
  instances: {
    href: links.instancesDocs,
    linkText: 'Instances',
  },
  vpcs: {
    href: links.vpcsDocs,
    linkText: 'Networking',
  },
}
