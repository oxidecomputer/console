import userEvent from '@testing-library/user-event'
import {
  clickByRole,
  renderAppAt,
  screen,
  typeByRole,
  waitForElementToBeRemoved,
  getByRole,
} from 'app/test/utils'
import { defaultFirewallRules } from '@oxide/api-mocks'

describe('VpcPage', () => {
  describe('firewall rule', () => {
    it('edit works', async () => {
      renderAppAt('/orgs/maze-war/projects/mock-project/vpcs/mock-vpc')
      clickByRole('tab', 'Firewall Rules')

      // default rules show up in the table
      for (const { name } of defaultFirewallRules) {
        await screen.findByText(name)
      }
      expect(screen.getAllByRole('row').length).toEqual(5) // 4 + header

      // the one we'll be adding is not there
      expect(screen.queryByRole('cell', { name: 'new-rule-name' })).toBeNull()

      // modal is not already open
      expect(
        screen.queryByRole('dialog', { name: 'Edit firewall rule' })
      ).toBeNull()

      // click more button on allow-icmp row to get menu, then click Edit
      const allowIcmpRow = screen.getByRole('row', { name: /allow-icmp/ })
      const more = getByRole(allowIcmpRow, 'button', { name: 'More' })
      await userEvent.click(more)

      const edit = screen.getByRole('menuitem', { name: 'Edit' })
      // needs to be userEvent and not fireEvent because reach menu is triggered
      // by mousedown. we could also fire mousedown but that feels brittle
      await userEvent.click(edit)

      // now the modal is open
      screen.getByRole('dialog', { name: 'Edit firewall rule' })

      // name is populated
      const name = screen.getByRole('textbox', { name: 'Name' })
      expect(name).toHaveValue('allow-icmp')

      // priority is populated
      const priority = screen.getByRole('spinbutton', { name: 'Priority' })
      expect(priority).toHaveValue(65534)

      // protocol is populated
      expect(screen.getByRole('checkbox', { name: /ICMP/ })).toBeChecked()
      expect(screen.getByRole('checkbox', { name: /TCP/ })).not.toBeChecked()
      expect(screen.getByRole('checkbox', { name: /UDP/ })).not.toBeChecked()

      // targets default vpc
      screen.getByRole('cell', { name: 'vpc' })
      screen.getByRole('cell', { name: 'default' })

      // update name
      await userEvent.clear(name)
      await userEvent.type(name, 'new-rule-name')

      // add host filter
      clickByRole('button', 'Host type')
      clickByRole('option', 'Instance')
      typeByRole('textbox', 'Value', 'edit-filter-instance')
      clickByRole('button', 'Add host filter')

      // host is added to hosts table
      screen.getByRole('cell', { name: 'edit-filter-instance' })

      // submit the form
      clickByRole('button', 'Update rule')

      // wait for modal to close
      await waitForElementToBeRemoved(
        () => screen.queryByText('Edit firewall rule'),
        // fails in CI without a longer timeout (default 1000). boo
        { timeout: 4000 }
      )

      // table refetches and now includes the updated rule name, not the old name
      await screen.findByText('new-rule-name')
      expect(screen.queryByRole('cell', { name: 'allow-icmp' })).toBeNull()
      expect(screen.getAllByRole('row').length).toEqual(5) // 4 + header

      screen.getByRole('cell', {
        name: 'instance edit-filter-instance ICMP',
      })

      // other 3 rules are still there
      const rest = defaultFirewallRules.filter((r) => r.name !== 'allow-icmp')
      for (const { name } of rest) {
        screen.getByRole('cell', { name })
      }
    }, 30000)
  })
})
