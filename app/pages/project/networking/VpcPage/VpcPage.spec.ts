import {
  fireEvent,
  renderAppAt,
  screen,
  userEvent,
  waitForElementToBeRemoved,
} from 'app/test-utils'

describe('VpcPage', () => {
  describe('subnets tab', () => {
    it('creating a subnet works', async () => {
      renderAppAt('/orgs/maze-war/projects/mock-project/vpcs/mock-vpc')
      screen.getByText('Subnets')

      // wait for subnet to show up in the table
      await screen.findByRole('cell', { name: 'mock-subnet' })
      // second one is not there though
      expect(screen.queryByRole('cell', { name: 'mock-subnet-2' })).toBeNull()

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

      // submit the form
      fireEvent.click(screen.getByRole('button', { name: 'Create subnet' }))

      // wait for modal to close
      await waitForElementToBeRemoved(
        () => screen.queryByRole('dialog', { name: 'Create subnet' }),
        // fails in CI without a longer timeout (default 1000). boo
        { timeout: 2000 }
      )

      // table refetches and now includes second subnet
      screen.getByRole('cell', { name: 'mock-subnet' })
      await screen.findByRole('cell', { name: 'mock-subnet-2' })
    }, 10000) // otherwise it flakes in CI
  })
})
