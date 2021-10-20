import { Icon } from './Icon'

export default { component: Icon }

export const Default = {
  args: { name: 'bookmark' },
}

export const CustomTitle = {
  args: { svgProps: { title: 'Cameron Howe' }, name: 'profile' },
}
