import { Breadcrumbs } from './Breadcrumbs'

export const Default = () => (
  <Breadcrumbs
    data={[
      { href: '/', label: 'Home' },
      { href: '/first', label: 'First page' },
      { href: '/second', label: 'Second page' },
      { href: '/third', label: 'Third page' },
    ]}
  />
)
