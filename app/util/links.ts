/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
export const links: Record<string, string> = {
  accessDocs: 'https://docs.oxide.computer/guides/configuring-access',
  cloudInitFormat: 'https://cloudinit.readthedocs.io/en/latest/explanation/format.html',
  cloudInitExamples: 'https://cloudinit.readthedocs.io/en/latest/reference/examples.html',
  disksDocs: 'https://docs.oxide.computer/guides/managing-disks-and-snapshots',
  firewallRulesDocs:
    'https://docs.oxide.computer/guides/configuring-guest-networking#_firewall_rules',
  floatingIpsDocs: 'https://docs.oxide.computer/guides/managing-floating-ips',
  iamPolicyDocs: 'https://docs.oxide.computer/guides/key-entities-and-concepts#iam-policy',
  imagesDocs: 'https://docs.oxide.computer/guides/creating-and-sharing-images',
  instancesDocs: 'https://docs.oxide.computer/guides/managing-instances',
  keyConceptsProjectsDocs:
    'https://docs.oxide.computer/guides/key-entities-and-concepts#_projects',
  projectsDocs: 'https://docs.oxide.computer/guides/onboarding-projects',
  sledDocs:
    'https://docs.oxide.computer/guides/architecture/service-processors#_server_sled',
  snapshotsDocs:
    'https://docs.oxide.computer/guides/managing-disks-and-snapshots#snapshots',
  storageDocs:
    'https://docs.oxide.computer/guides/architecture/os-hypervisor-storage#_physical_layer',
  systemIpPoolsDocs: 'https://docs.oxide.computer/guides/operator/ip-pool-management',
  systemMetricsDocs: 'https://docs.oxide.computer/guides/operator/system-metrics',
  systemSiloDocs: 'https://docs.oxide.computer/guides/operator/silo-management',
  vmsDocs:
    'https://docs.oxide.computer/guides/deploying-workloads#_creating_virtual_machines',
  vpcsDocs: 'https://docs.oxide.computer/guides/configuring-guest-networking',
}

// These are links (and associated titles) to help documentation
export const docLinks = {
  access: {
    href: links.accessDocs,
    linkText: 'Access',
  },
  disks: {
    href: links.disksDocs,
    linkText: 'Managing Disks',
  },
  firewallRules: {
    href: links.firewallRulesDocs,
    linkText: 'Firewall Rules',
  },
  floatingIps: {
    href: links.floatingIpsDocs,
    linkText: 'Floating IPs',
  },
  iam: {
    href: links.iamPolicyDocs,
    linkText: 'Identity & Access Management Policy',
  },
  images: {
    href: links.imagesDocs,
    linkText: 'Creating and Sharing Images',
  },
  instances: {
    href: links.instancesDocs,
    linkText: 'Managing Instances',
  },
  keyConceptsProjects: {
    href: links.keyConceptsProjectsDocs,
    linkText: 'Key Concepts: Projects',
  },
  projects: {
    href: links.projectsDocs,
    linkText: 'Managing Projects',
  },
  sleds: {
    href: links.sledDocs,
    linkText: 'Server Sleds',
  },
  snapshots: {
    href: links.snapshotsDocs,
    linkText: 'Managing Snapshots',
  },
  storage: {
    href: links.storageDocs,
    linkText: 'Storage',
  },
  systemIpPools: {
    href: links.systemIpPoolsDocs,
    linkText: 'IP Pool Management',
  },
  systemMetrics: {
    href: links.systemMetricsDocs,
    linkText: 'System Metrics',
  },
  systemSilo: {
    href: links.systemSiloDocs,
    linkText: 'Silo Management',
  },
  vms: {
    href: links.vmsDocs,
    linkText: 'Virtual Machines and Deploying Workloads',
  },
  vpcs: {
    href: links.vpcsDocs,
    linkText: 'VPCs and Subnets',
  },
}
