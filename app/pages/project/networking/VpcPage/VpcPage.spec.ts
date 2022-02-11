import {
  clickByRole,
  clickBySelectorAndText,
  clickByText,
  findBySelectorAndText,
  getBySelectorAndText,
  queryBySelectorAndText,
  typeByLabelText,
  getByText,
  renderAppAt,
  screen,
  typeByRole,
  userEvent,
  waitForElementToBeRemoved,
  fireEvent,
  waitFor,
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
      expect(queryBySelectorAndText('td', 'mock-subnet-2')).toBeNull()

      // modal is not already open
      expect(screen.queryByTestId('create-vpc-subnet-modal')).toBeNull()

      // click button to open modal
      clickBySelectorAndText('button', 'New subnet')

      // modal is open
      screen.getByRole('dialog', { name: 'Create subnet' })

      typeByLabelText('IPv4 block', '1.1.1.2/24')

      typeByLabelText('Name', 'mock-subnet-2')

      // submit the form
      clickBySelectorAndText('button', 'Create subnet')

      // wait for modal to close
      await waitForElementToBeRemoved(() =>
        screen.queryByTestId('create-vpc-subnet-modal')
      )

      // table refetches and now includes second subnet
      await screen.findByText('mock-subnet')
      await screen.findByText('mock-subnet-2')
    })
  })

  describe('firewall rule', () => {
    it('create works', async () => {
      renderAppAt('/orgs/maze-war/projects/mock-project/vpcs/mock-vpc')
      await clickByRole('tab', 'Firewall Rules')

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
      await clickByRole('button', 'New rule')

      // modal is open
      screen.getByRole('dialog', { name: 'Create firewall rule' })

      typeByRole('textbox', 'Name', 'my-new-rule')

      await clickByRole('radio', 'Outgoing')

      // input type="number" becomes spinbutton for some reason
      typeByRole('spinbutton', 'Priority', '5')

      await clickByRole('button', 'Target type')
      await clickByRole('option', 'VPC')
      typeByRole('textbox', 'Target name', 'my-target-vpc')
      await clickByRole('button', 'Add target')

      // target is added to targets table
      screen.getByRole('cell', { name: 'my-target-vpc' })

      await clickByRole('button', 'Host type')
      await clickByRole('option', 'Instance')
      typeByRole('textbox', 'Value', 'host-filter-instance')
      await clickByRole('button', 'Add host filter')

      // host is added to hosts table
      screen.getByRole('cell', { name: 'host-filter-instance' })

      // TODO: test invalid port range once I put an error message in there
      typeByRole('textbox', 'Port filter', '123-456')
      await clickByRole('button', 'Add port filter')

      // port range is added to port ranges table
      screen.getByRole('cell', { name: '123-456' })

      await clickByRole('checkbox', 'UDP')

      // submit the form
      await clickByRole('button', 'Create rule')

      // wait for modal to close
      await waitForElementToBeRemoved(
        () => screen.queryByText('Create firewall rule'),
        // fails in CI without a longer timeout (default 1000). boo
        { timeout: 2000 }
      )

      // table refetches and now includes the new rule as well as the originals
      await screen.findByText('my-new-rule')
      screen.getByRole('cell', {
        name: 'instance host-filter-instance UDP 123-456',
      })

      for (const { name } of defaultFirewallRules) {
        screen.getByText(name)
      }
    }, 20000)

    it('edit works', async () => {
      renderAppAt('/orgs/maze-war/projects/mock-project/vpcs/mock-vpc')
      await clickByText('Firewall Rules')

      // default rules show up in the table
      await waitFor(() =>
        expect(document.querySelectorAll('tbody tr').length).toEqual(4)
      )
      for (const { name } of defaultFirewallRules) {
        screen.getByText(name)
      }

      // the one we'll be adding is not there
      expect(screen.queryByText('new-rule-name')).toBeNull()

      // modal is not already open
      expect(screen.queryByText('Edit firewall rule')).toBeNull()

      // click more button on allow-icmp row to get menu, then click Edit
      const allowIcmpRow = getBySelectorAndText('tr', /allow-icmp/)
      const more = getByText(allowIcmpRow, 'More')
      await userEvent.click(more)

      await clickByRole('menuitem', 'Edit')

      // now the modal is open
      screen.getByText('Edit firewall rule')

      // name is populated
      const name = screen.getByRole('textbox', { name: 'Name' })
      expect(name).toHaveValue('allow-icmp')

      // priority is populated
      const priority = screen.getByRole('spinbutton', { name: 'Priority' })
      expect(priority).toHaveValue(65534)

      // protocol is populated
      expect(screen.getByLabelText(/ICMP/)).toBeChecked()
      expect(screen.getByLabelText(/TCP/)).not.toBeChecked()
      expect(screen.getByLabelText(/UDP/)).not.toBeChecked()

      // targets default vpc
      getBySelectorAndText('td', 'vpc')
      getBySelectorAndText('td', 'default')

      // update name
      fireEvent.change(name, { target: { value: 'new-rule-name' } })

      // add host filter
      clickBySelectorAndText('button', /Host type/)
      clickBySelectorAndText('[role=option]', 'Instance')
      fireEvent.change(screen.getByLabelText('Value'), {
        target: { value: 'edit-filter-instance' },
      })
      clickBySelectorAndText('button', 'Add host filter')

      // host is added to hosts table
      getBySelectorAndText('td', 'edit-filter-instance')

      // submit the form
      clickBySelectorAndText('button', 'Update rule')

      // wait for modal to close
      await waitForElementToBeRemoved(
        () => screen.queryByText('Edit firewall rule'),
        // fails in CI without a longer timeout (default 1000). boo
        { timeout: 2000 }
      )

      // table refetches and now includes the updated rule name, not the old name
      await findBySelectorAndText('td', 'new-rule-name')
      expect(queryBySelectorAndText('td', 'allow-icmp')).toBeNull()
      expect(document.querySelectorAll('tbody tr').length).toEqual(4)

      // the filters cell says "Instance edit-filter-instance" and "ICMP"
      getBySelectorAndText('td', 'instanceedit-filter-instanceICMP')

      // other 3 rules are still there
      const rest = defaultFirewallRules.filter((r) => r.name !== 'allow-icmp')
      for (const { name } of rest) {
        getBySelectorAndText('td', name)
      }
    })
  })
})
