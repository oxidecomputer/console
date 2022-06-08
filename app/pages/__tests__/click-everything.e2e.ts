import { test } from '@playwright/test'

import { expectNotVisible, expectVisible } from 'app/util/e2e'

test("Click through everything and make it's all there", async ({ page }) => {
  await page.goto('/')
  await expectVisible(page, [
    // note substring matcher bc headers have icons that mess with accessible name
    // TODO: maybe that's bad and we should fix it in the code
    'role=heading[name*="Organizations"]',
    'role=cell[name="maze-war"]',
  ])

  // create org form
  await page.click('role=link[name="New Organization"]')
  await expectVisible(page, [
    'role=heading[name*="Create organization"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=button[name="Create organization"][disabled]',
  ])
  await page.goBack()

  // org page (redirects to /org/org-name/projects)
  await page.click('role=link[name="maze-war"]')
  await expectVisible(page, [
    'role=heading[name*="Projects"]',
    'role=cell[name="mock-project"]',
  ])

  // create project form
  await page.click('role=link[name="New Project"]')
  await expectVisible(page, [
    'role=heading[name*="Create project"]', // TODO: standardize capitalization
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=button[name="Create project"][disabled]',
  ])
  await page.goBack()

  // Project page (instances list)
  await page.click('role=link[name="mock-project"]')
  await expectVisible(page, ['role=heading[name*="Instances"]', 'role=cell[name="db1"]'])

  // Instance create form
  await page.click('role=link[name="New Instance"]')
  await expectVisible(page, [
    'role=heading[name*="Create instance"]',
    'role=heading[name="Hardware"]',
    'role=heading[name="Boot disk"]',
    'role=heading[name="Additional disks"]',
    'role=heading[name="Networking"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=textbox[name="Disk name"]',
    'role=radiogroup[name="Block size (Bytes)"]',
    'role=spinbutton[name="Disk size (GiB)"]',
    'role=radiogroup[name="Network interface"]',
    'role=textbox[name="Hostname"]',
    'role=button[name="Create instance"][disabled]',
  ])
  await page.goBack()

  // Instance detail
  await page.click('role=link[name="db1"]')
  await expectVisible(page, [
    'role=heading[name*=db1]',
    'role=tab[name="Storage"]',
    'role=tab[name="Metrics"]',
    'role=tab[name="Networking"]',
    'role=table[name="Boot disk"] >> role=cell[name="disk-1"]',
    'role=table[name="Attached disks"] >> role=cell[name="disk-2"]',
    // buttons disabled while instance is running
    'role=button[name="Create new disk"][disabled]',
    'role=button[name="Attach existing disk"][disabled]',
    // TODO: assert minitable contents
  ])
  await expectNotVisible(page, ['role=cell[name="disk-3"]'])

  // Stop instance
  await page.click('role=button[name="Instance actions"]')
  await page.click('role=menuitem[name="Stop"]')
  // Close toast, it holds up the test for some reason
  await page.click('role=button[name="Dismiss notification"]')

  // New disk form
  await page.click('role=button[name="Create new disk"]')
  await expectVisible(page, [
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=radiogroup[name="Block size (Bytes)"]',
    'role=spinbutton[name="Size (GiB)"]',
    'role=button[name="Create Disk"][disabled]',
  ])
  await page.click('role=button[name="Close form"]')

  await page.click('role=button[name="Create new disk"]')
  await page.click('role=button[name="Cancel"]')

  // Attach existing disk form
  await page.click('role=button[name="Attach existing disk"]')
  await page.click('role=combobox[name="Disk name"]')
  await expectVisible(page, ['role=option[name="disk-3"]', 'role=option[name="disk-4"]'])

  // Attach disk-3
  await page.click('role=option[name="disk-3"]')
  await page.click('role=button[name="Attach Disk"]')
  await expectVisible(page, [
    'role=table[name="Attached disks"] >> role=cell[name="disk-3"]',
  ])

  // Instance networking tab
  await page.click('role=tab[name="Networking"]')
  await expectVisible(page, ['role=cell[name="my-nic"]'])
  await page.click('role=button[name="Add network interface"]')

  // Add network interface
  // TODO: modal title is not getting hooked up, IDs are wrong
  await expectVisible(page, [
    'role=heading[name="Add network interface"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=combobox[name="VPC"]',
    'role=combobox[name="Subnet"]',
    'role=textbox[name="IP Address"]',
  ])

  await page.fill('role=textbox[name="Name"]', 'nic-2')
  await page.click('role=combobox[name="VPC"]')
  await page.click('role=option[name="mock-vpc"]')
  await page.click('role=combobox[name="Subnet"]')
  await page.click('role=option[name="mock-subnet"]')
  await page.click('role=button[name="Add network interface"]')
  await expectVisible(page, ['role=cell[name="nic-2"]'])

  // Delete just-added network interface
  await page
    .locator('role=row', { hasText: 'nic-2' })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Delete"]')
  // Close toast, it holds up the test for some reason
  await page.click('role=button[name="Dismiss notification"]')
  await expectNotVisible(page, ['role=cell[name="nic-2"]'])

  // Snapshots page
  await page.click('role=link[name*="Snapshots"]')
  await expectVisible(page, [
    'role=heading[name*="Snapshots"]',
    'role=cell[name="snapshot-1"]',
    'role=cell[name="snapshot-2"]',
    'role=cell[name="snapshot-3"]',
    'role=cell[name="snapshot-4"]',
  ])

  // Disks page
  await page.click('role=link[name*="Disks"]')
  await expectVisible(page, [
    'role=heading[name*="Disks"]',
    'role=cell[name="disk-1"]',
    'role=cell[name="disk-2"]',
    'role=cell[name="disk-3"]',
    'role=cell[name="disk-4"]',
  ])
  await page.click('role=cell[name="db1"] >> role=link')
  await expectVisible(page, ["role=heading[name*='db1']"])
  await page.goBack()

  // TODO: assert that disks 1-3 are attached and 4 is not

  // Create disk form
  await page.click('role=link[name="New Disk"]')
  await expectVisible(page, [
    'role=heading[name*="Create disk"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=radiogroup[name="Block size (Bytes)"]',
    'role=spinbutton[name="Size (GiB)"]',
    'role=button[name="Create Disk"][disabled]',
  ])
  await page.goBack()

  // Test pagination
  await page.click('role=button[name="next"]')
  await expectVisible(page, ['role=heading[name*="Disks"]', 'role=cell[name="disk-11"]'])
  await page.click('role=button[name*="prev"]')
  await expectVisible(page, [
    'role=heading[name*="Disks"]',
    'role=cell[name="disk-1"]',
    'role=cell[name="disk-2"]',
    'role=cell[name="disk-3"]',
    'role=cell[name="disk-4"]',
  ])

  // Access & IAM
  await page.click('role=link[name*="Access & IAM"]')
  // not implemented

  // Images
  await page.click('role=link[name*="Images"]')
  await expectVisible(page, [
    'role=heading[name*="Images"]',
    'role=cell[name="image-1"]',
    'role=cell[name="image-2"]',
    'role=cell[name="image-3"]',
    'role=cell[name="image-4"]',
  ])

  // Networking
  await page.click('role=link[name*="Networking"]')
  await expectVisible(page, [
    'role=heading[name*="VPCs"]',
    'role=cell[name="mock-vpc"] >> nth=0',
  ])

  // New VPC form
  await page.click('role=link[name="New VPC"]')
  await expectVisible(page, [
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=textbox[name="DNS name"]',
    'role=textbox[name="IPV6 prefix"]',
    'role=button[name="Create VPC"][disabled]',
  ])
  await page.goBack()

  await page.click('role=link[name="mock-vpc"]')

  // VPC detail, subnets tab
  await expectVisible(page, [
    'role=heading[name*="mock-vpc"]',
    'role=tab[name="Subnets"]',
    'role=tab[name="System Routes"]',
    'role=tab[name="Routers"]',
    'role=tab[name="Firewall Rules"]',
    'role=tab[name="Gateways"]',
    'role=cell[name="mock-subnet"]',
    // TODO: assert minitable contents
  ])

  // Create subnet
  await page.click('role=button[name="New subnet"]')
  await expectVisible(page, [
    'role=heading[name="Create subnet"]',
    'role=button[name="Create subnet"][disabled]',
  ])
  await page.fill('role=textbox[name="Name"]', 'new-subnet')
  await page.click('role=button[name="Create subnet"]')

  // Edit subnet
  await expectVisible(page, ['role=cell[name="new-subnet"]'])
  await page
    .locator('role=row', { hasText: 'new-subnet' })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Edit"]')

  await expectVisible(page, [
    'role=heading[name="Edit subnet"]',
    'role=button[name="Update subnet"][disabled]',
  ])
  await page.fill('role=textbox[name="Name"]', 'edited-subnet')
  await page.fill('role=textbox[name="Description"]', 'behold')
  await page.click('role=button[name="Update subnet"]')

  await expectNotVisible(page, ['role=cell[name="new-subnet"]'])
  await expectVisible(page, ['role=cell[name="edited-subnet"]'])

  // System routes
  await page.click('role=tab[name="System Routes"]')
  await expectVisible(page, ['role=cell[name="system"]'])

  // Routers
  await page.click('role=tab[name="Routers"]')
  await expectVisible(page, ['role=cell[name="system"] >> nth=0'])
  await page.click('role=button[name="New router"]')
  await expectVisible(page, [
    'role=heading[name="Create VPC router"]',
    'role=button[name="Create VPC router"][disabled]',
  ])
  await page.fill('role=textbox[name="Name"]', 'new-router')
  await page.click('role=button[name="Create VPC router"]')
  await expectVisible(page, ['role=cell[name="new-router"]', 'role=cell[name="custom"]'])

  // Firewall rules
  await page.click('role=tab[name="Firewall Rules"]')
  await expectVisible(page, [
    'role=cell[name="allow-icmp"]',
    'role=cell[name="allow-internal-inbound"]',
    'role=cell[name="allow-rdp"]',
    'role=cell[name="allow-ssh"]',
  ])

  // Gateways
  await page.click('role=tab[name="Gateways"]')
  // not implemeneted
})
