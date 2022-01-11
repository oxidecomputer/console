import {
  fireEvent,
  renderAppAt,
  screen,
  userEvent,
  waitForElementToBeRemoved,
} from 'app/test-utils'
import { msw, org, project, vpcSubnet, vpcSubnet2 } from '@oxide/api-mocks'

const subnetsUrl = `/api/organizations/${org.name}/projects/${project.name}/vpcs/default/subnets`

describe('VpcPage', () => {
  describe('subnets tab', () => {
    it('creating a subnet works', async () => {
      renderAppAt('/orgs/mock-org/projects/mock-project/vpcs/default')
      screen.getByText('Subnets')

      // wait for subnet to show up in the table
      await screen.findByRole('cell', { name: vpcSubnet.name })

      // modal is not already open
      expect(screen.queryByRole('dialog', { name: 'Create subnet' })).toBeNull()

      // click button to open modal
      fireEvent.click(screen.getByRole('button', { name: 'New subnet' }))

      // modal is open
      screen.getByRole('dialog', { name: 'Create subnet' })

      const ipv4 = screen.getByRole('textbox', { name: 'IPv4 block' })
      userEvent.type(ipv4, '1.1.1.2/24')

      const name = screen.getByRole('textbox', { name: 'Name' })
      userEvent.type(name, 'mock-subnet-2')

      // this is temporary, a workaround for the fact that the mock server
      // doesn't have a persistence layer yet
      msw.override('get', subnetsUrl, 200, { items: [vpcSubnet, vpcSubnet2] })

      // submit the form
      fireEvent.click(screen.getByRole('button', { name: 'Create subnet' }))

      // wait for modal to close
      await waitForElementToBeRemoved(
        () => screen.queryByRole('dialog', { name: 'Create subnet' }),
        // fails in CI without a longer timeout (default 1000). boo
        { timeout: 2000 }
      )

      // TODO: before, we asserted what body the form posted. MSW strongly
      // discourages this because it's testing implementation details, but I
      // can't shake the feeling that I want it. But it might feel better after
      // the MSW mock is more sophisticated and actually handles a create by
      // inserting the thing in the list of subnets. Then our assertion that it
      // showed up in the list actually does check what was posted.

      // table should refetch and now include second subnet
      screen.getByRole('cell', { name: vpcSubnet.name })
      await screen.findByRole('cell', { name: vpcSubnet2.name })
    })
  })
})
