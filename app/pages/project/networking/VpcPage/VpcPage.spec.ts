import {
  fireEvent,
  lastPostBody,
  renderAppAt,
  screen,
  userEvent,
  waitForElementToBeRemoved,
} from 'app/test-utils'
import fetchMock from 'fetch-mock'
import {
  org,
  project,
  vpc,
  vpcSubnet,
  vpcSubnet2,
  vpcSubnets,
} from '@oxide/api-mocks'

const vpcUrl = `/api/organizations/${org.name}/projects/${project.name}/vpcs/default`
const subnetsUrl = `${vpcUrl}/subnets`
const getSubnetsUrl = `${subnetsUrl}?limit=10`

describe('VpcPage', () => {
  describe('subnets tab', () => {
    it('creating a subnet works', async () => {
      fetchMock.get('/api/session/me', 200)
      fetchMock.get(vpcUrl, { status: 200, body: vpc })
      fetchMock.getOnce(getSubnetsUrl, { status: 200, body: vpcSubnets })
      const postMock = fetchMock.postOnce(subnetsUrl, {
        status: 201,
        body: vpcSubnet2,
      })

      renderAppAt('/orgs/mock-org/projects/mock-project/vpcs/default')
      screen.getByText('Subnets')

      // wait for subnet to show up in the table
      await screen.findByRole('cell', { name: vpcSubnet.identity.name })

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

      // override the subnets GET to include both subnets
      fetchMock.getOnce(
        getSubnetsUrl,
        {
          status: 200,
          body: { items: [vpcSubnet, vpcSubnet2] },
        },
        { overwriteRoutes: true }
      )

      // submit the form
      fireEvent.click(screen.getByRole('button', { name: 'Create subnet' }))

      // wait for modal to close
      await waitForElementToBeRemoved(() =>
        screen.queryByRole('dialog', { name: 'Create subnet' })
      )

      // it posted the form
      expect(lastPostBody(postMock)).toEqual({
        ipv4Block: '1.1.1.2/24',
        ipv6Block: null,
        name: 'mock-subnet-2',
        description: '',
      })

      // table should refetch and now include second subnet
      screen.getByRole('cell', { name: vpcSubnet.identity.name })
      screen.getByRole('cell', { name: vpcSubnet2.identity.name })
    })
  })
})
