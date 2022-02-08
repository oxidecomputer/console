import {
  renderAppAt,
  screen,
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
      await screen.findByText('mock-subnet')
      // the one we'll be adding is not there
      expect(screen.queryByRole('cell', { name: 'mock-subnet-2' })).toBeNull()

      // modal is not already open
      expect(screen.queryByTestId('create-vpc-subnet-modal')).toBeNull()

      // click button to open modal
      clickByRole('button', 'New subnet')

      // modal is open
      screen.getByRole('dialog', { name: 'Create subnet' })

      typeByRole('textbox', 'IPv4 block', '1.1.1.2/24')

      typeByRole('textbox', 'Name', 'mock-subnet-2')

      // submit the form
      clickByRole('button', 'Create subnet')

      // wait for modal to close
      await waitForElementToBeRemoved(() =>
        screen.queryByTestId('create-vpc-subnet-modal')
      )

      // table refetches and now includes second subnet
      await screen.findByText('mock-subnet')
      await screen.findByText('mock-subnet-2')
    }, 10000) // otherwise it flakes in CI
  })

  describe('firewall rule', () => {
    it('create works', async () => {
      renderAppAt('/orgs/maze-war/projects/mock-project/vpcs/mock-vpc')
      clickByRole('tab', 'Firewall Rules')

      // default rules show up in the table
      for (const { name } of defaultFirewallRules) {
        await screen.findByText(name)
      }
      // the one we'll be adding is not there
      expect(screen.queryByRole('cell', { name: 'my-new-rule' })).toBeNull()

      // modal is not already open
      expect(
        screen.queryByRole('dialog', { name: 'Create firewall rule' })
      ).toBeNull()

      // click button to open modal
      clickByRole('button', 'New rule')

      // modal is open
      await screen.findByText('Create firewall rule')

      typeByRole('textbox', 'Name', 'my-new-rule')

      clickByRole('radio', 'Outgoing')

      // input type="number" becomes spinbutton for some reason
      typeByRole('spinbutton', 'Priority', '5')

      clickByRole('button', 'Target type')
      clickByRole('option', 'VPC')
      typeByRole('textbox', 'Target name', 'my-target-vpc')
      clickByRole('button', 'Add target')

      // target is added to targets table
      screen.getByRole('cell', { name: 'my-target-vpc' })

      clickByRole('button', 'Host type')
      clickByRole('option', 'Instance')
      typeByRole('textbox', 'Value', 'my-target-instance')
      clickByRole('button', 'Add host filter')

      // host is added to hosts table
      screen.getByRole('cell', { name: 'my-target-instance' })

      // TODO: test invalid port range once I put an error message in there
      typeByRole('textbox', 'Port filter', '123-456')
      clickByRole('button', 'Add port filter')

      // port range is added to port ranges table
      screen.getByRole('cell', { name: '123-456' })

      clickByRole('checkbox', 'UDP')

      // submit the form
      clickByRole('button', 'Create rule')

      // wait for modal to close
      await waitForElementToBeRemoved(
        () => screen.queryByText('Create firewall rule'),
        // fails in CI without a longer timeout (default 1000). boo
        { timeout: 2000 }
      )

      // table refetches and now includes the new rule as well as the originals
      await screen.findByText('my-new-rule')
      for (const { name } of defaultFirewallRules) {
        screen.getByText(name)
      }
    }, 10000)
  })
})
