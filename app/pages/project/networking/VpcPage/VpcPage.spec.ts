import {
  fireEvent,
  // logRoles,
  renderAppAt,
  screen,
  // userEvent,
} from '../../../../test-utils'

describe('VpcPage', () => {
  describe('subnets tab', () => {
    it('does something', async () => {
      renderAppAt('/orgs/maze-war/projects/prod-online/vpcs/default')
      screen.getByText('Subnets')
      const newSubnet = screen.getByRole('button', { name: 'New Subnet' })
      expect(screen.queryByRole('button', { name: 'Create subnet' })).toBeNull()
      fireEvent.click(newSubnet)

      // const ipv4 = screen.getByRole('textbox', { name: 'IPv4 block' })
      // const ipv6 = screen.getByRole('textbox', { name: 'IPv6 block' })
      // const name = screen.getByRole('textbox', { name: 'Name' })

      // this pisses off testing library, "formik change outside of act()". ugh
      // userEvent.type(ipv4, 'new-subnet')

      // const form = document.getElementById('create-vpc-subnet-form')!
      // screen.debug(form, 10000)
      // logRoles(form)

      // const submit = screen.getByRole('button', { name: 'Create subnet' })
    })
  })
})
