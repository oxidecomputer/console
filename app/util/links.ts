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
  cloudInitFormat: 'https://cloudinit.readthedocs.io/en/latest/explanation/format.html',
  cloudInitExamples: 'https://cloudinit.readthedocs.io/en/latest/reference/examples.html',
  disksDocs: 'https://docs.oxide.computer/guides/managing-disks-and-snapshots',
  firewallRulesDocs:
    'https://docs.oxide.computer/guides/configuring-guest-networking#_firewall_rules',
  floatingIpsDocs: 'https://docs.oxide.computer/guides/managing-floating-ips',
  gatewaysDocs:
    'https://docs.oxide.computer/guides/configuring-guest-networking#internet-gateway',
  imagesDocs: 'https://docs.oxide.computer/guides/creating-and-sharing-images',
  preparingImagesDocs:
    'https://docs.oxide.computer/guides/creating-and-sharing-images#_preparing_images_for_import',
  identityProvidersDocs:
    'https://docs.oxide.computer/guides/system/completing-rack-config#_configure_silo_identity_provider',
  instanceActionsDocs: 'https://docs.oxide.computer/guides/managing-instances',
  // TODO: link to section
  instanceBootDiskDocs: 'https://docs.oxide.computer/guides/deploying-workloads',
  keyConceptsIamPolicyDocs:
    'https://docs.oxide.computer/guides/key-entities-and-concepts#iam-policy',
  keyConceptsProjectsDocs:
    'https://docs.oxide.computer/guides/key-entities-and-concepts#_projects',
  projectsDocs: 'https://docs.oxide.computer/guides/onboarding-projects',
  quickStart: 'https://docs.oxide.computer/guides/quickstart',
  routersDocs:
    'https://docs.oxide.computer/guides/configuring-guest-networking#_custom_routers',
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
  transitIpsDocs:
    'https://docs.oxide.computer/guides/configuring-guest-networking#_example_4_software_routing_tunnels',
  instancesDocs: 'https://docs.oxide.computer/guides/deploying-workloads',
  vpcsDocs: 'https://docs.oxide.computer/guides/configuring-guest-networking',
}

// These are links (and associated titles) to help documentation
export const docLinks = {
  access: {
    href: links.accessDocs,
    linkText: 'Access Control',
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
  instances: {
    href: links.instancesDocs,
    linkText: 'Instances',
  },
  vpcs: {
    href: links.vpcsDocs,
    linkText: 'Networking',
  },
}
