import {
  renderAppAt,
  screen,
  userEvent,
  waitForElementToBeRemoved,
  clickByRole,
  typeByRole,
} from 'app/test-utils'
import { defaultFirewallRules } from '@oxide/api-mocks'

describe('VpcPage', () => {
  describe('subnet', () => {
    it('create works', async () => {
      renderAppAt('/orgs/maze-war/projects/mock-project/vpcs/mock-vpc')
      screen.getByText('Subnets')

      // wait for subnet to show up in the table
      await screen.findByRole('cell', { name: 'mock-subnet' })
      // the one we'll be adding is not there
      expect(screen.queryByRole('cell', { name: 'mock-subnet-2' })).toBeNull()

      // modal is not already open
      expect(screen.queryByRole('dialog', { name: 'Create subnet' })).toBeNull()

      // click button to open modal
      await userEvent.click(screen.getByRole('button', { name: 'New subnet' }))

      // modal is open
      screen.getByRole('dialog', { name: 'Create subnet' })

      const ipv4 = screen.getByRole('textbox', { name: 'IPv4 block' })
      await userEvent.type(ipv4, '1.1.1.2/24')

      const name = screen.getByRole('textbox', { name: 'Name' })
      await userEvent.type(name, 'mock-subnet-2')

      // submit the form
      await userEvent.click(
        screen.getByRole('button', { name: 'Create subnet' })
      )

      // wait for modal to close
      await waitForElementToBeRemoved(
        () => screen.queryByRole('dialog', { name: 'Create subnet' }),
        // fails in CI without a longer timeout (default 1000). boo
        { timeout: 2000 }
      )

      // table refetches and now includes second subnet
      await screen.findByRole('cell', { name: 'mock-subnet' })
      await screen.findByRole('cell', { name: 'mock-subnet-2' })
    }, 10000) // otherwise it flakes in CI
  })

  describe('firewall rule', () => {
    it('create works', async () => {
      renderAppAt('/orgs/maze-war/projects/mock-project/vpcs/mock-vpc')
      await clickByRole('tab', 'Firewall Rules')

      // default rules show up in the table
      for (const { name } of defaultFirewallRules) {
        await screen.findByRole('cell', { name })
      }
      // the one we'll be adding is not there
      expect(screen.queryByRole('cell', { name: 'my-new-rule' })).toBeNull()

      // modal is not already open
      expect(
        screen.queryByRole('dialog', { name: 'Create firewall rule' })
      ).toBeNull()

      // click button to open modal
      await clickByRole('button', 'New rule')

      // modal is open
      await screen.findByRole('dialog', { name: 'Create firewall rule' })

      await typeByRole('textbox', 'Name', 'my-new-rule')

      await clickByRole('radio', 'Outgoing')

      // input type="number" becomes spinbutton for some reason
      await typeByRole('spinbutton', 'Priority', '5')

      await clickByRole('button', 'Target type')
      await clickByRole('option', 'VPC')
      await typeByRole('textbox', 'Target name', 'my-target-vpc')
      await clickByRole('button', 'Add target')

      // target is added to targets table
      screen.getByRole('cell', { name: 'my-target-vpc' })

      await clickByRole('button', 'Host type')
      await clickByRole('option', 'Instance')
      await typeByRole('textbox', 'Value', 'my-target-instance')
      await clickByRole('button', 'Add host filter')

      // host is added to hosts table
      screen.getByRole('cell', { name: 'my-target-instance' })

      // TODO: test invalid port range once I put an error message in there
      await typeByRole('textbox', 'Port filter', '123-456')
      await clickByRole('button', 'Add port filter')

      // port range is added to port ranges table
      screen.getByRole('cell', { name: '123-456' })

      await clickByRole('checkbox', 'UDP')

      // submit the form
      await clickByRole('button', 'Create rule')

      // wait for modal to close
      await waitForElementToBeRemoved(
        () => screen.queryByRole('dialog', { name: 'Create firewall rule' }),
        // fails in CI without a longer timeout (default 1000). boo
        { timeout: 2000 }
      )

      // table refetches and now includes the new rule
      await screen.findByRole('cell', { name: 'my-new-rule' })
    }, 15000)
  })
})
