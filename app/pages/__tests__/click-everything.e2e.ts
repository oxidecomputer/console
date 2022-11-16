import { test } from '@playwright/test'

import { expectNotVisible, expectVisible } from 'app/test/e2e'

test("Click through everything and make it's all there", async ({ page }) => {
  // TODO: This test is slow af. Let's break it down.
  test.setTimeout(60000)

  await page.goto('/orgs/maze-war/projects')

  // Project page (instances list)
  await page.click('role=link[name="mock-project"]')
  await expectVisible(page, ['role=heading[name*="Instances"]', 'role=cell[name="db1"]'])

  await page.click('role=link[name="db1"]')
  await expectVisible(page, [
    'role=heading[name*=db1]',
    'role=tab[name="Storage"]',
    'role=tab[name="Metrics"]',
    'role=tab[name="Network Interfaces"]',
    'role=table[name="Boot disk"] >> role=cell[name="disk-1"]',
    'role=table[name="Attached disks"] >> role=cell[name="disk-2"]',
    // buttons disabled while instance is running
    'role=button[name="Create new disk"][disabled]',
    'role=button[name="Attach existing disk"][disabled]',
    // TODO: assert minitable contents
  ])
  await expectNotVisible(page, ['role=cell[name="disk-3"]'])

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
    'role=heading[name*="Create Disk"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=radiogroup[name="Block size (Bytes)"]',
    'role=spinbutton[name="Size (GiB)"]',
    'role=button[name="Create Disk"]',
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
  await page.click('role=link[name="New Vpc"]')
  await expectVisible(page, [
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=textbox[name="DNS name"]',
    'role=textbox[name="IPV6 prefix"]',
    'role=button[name="Create VPC"]',
  ])
  await page.goBack()

  // Edit VPC form
  await expectVisible(page, ['role=link[name="mock-vpc"]'])
  await page
    .locator('role=row', { hasText: 'mock-vpc' })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Edit"]')
  await expectVisible(page, [
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=textbox[name="DNS name"]',
    'role=button[name="Save changes"]',
  ])
  await page.fill('role=textbox[name="Name"]', 'new-vpc')
  await page.click('role=button[name="Save changes"]')

  // Close toast, it holds up the test for some reason
  await page.click('role=button[name="Dismiss notification"]')

  await expectVisible(page, ['role=link[name="new-vpc"]'])

  await page.click('role=link[name="new-vpc"]')

  // VPC detail, subnets tab
  await expectVisible(page, [
    'role=heading[name*="new-vpc"]',
    'role=tab[name="Subnets"]',
    'role=tab[name="System Routes"]',
    'role=tab[name="Routers"]',
    'role=tab[name="Firewall Rules"]',
    'role=cell[name="mock-subnet"]',
    // TODO: assert minitable contents
  ])

  // Create subnet
  await page.click('role=button[name="New subnet"]')
  await expectVisible(page, [
    'role=heading[name="Create subnet"]',
    'role=button[name="Create subnet"]',
  ])
  await page.fill('role=textbox[name="Name"]', 'new-subnet')
  await page.fill('role=textbox[name="IPv4 block"]', '10.1.1.1/24')
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
    'role=button[name="Update subnet"]',
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
    'role=heading[name="Create VPC Router"]',
    'role=button[name="Create VPC Router"]',
  ])
  await page.fill('role=textbox[name="Name"]', 'new-router')
  await page.click('role=button[name="Create VPC Router"]')
  await expectVisible(page, ['role=cell[name="new-router"]', 'role=cell[name="custom"]'])

  // Firewall rules
  await page.click('role=tab[name="Firewall Rules"]')
  await expectVisible(page, [
    'role=cell[name="allow-icmp"]',
    'role=cell[name="allow-internal-inbound"]',
    'role=cell[name="allow-rdp"]',
    'role=cell[name="allow-ssh"]',
  ])
})
