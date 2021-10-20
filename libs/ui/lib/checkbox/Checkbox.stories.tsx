import { Checkbox } from './Checkbox'

export default {
  component: Checkbox,
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    children: { control: 'text' },
  },
}

export const Unchecked = {
  args: { checked: false, indeterminate: false, children: 'Label' },
}
export const Checked = {
  args: { checked: true, indeterminate: false, children: 'Label' },
}
export const Indeterminate = {
  args: { checked: false, indeterminate: true, children: 'Label' },
}
export const NoLabel = {
  args: { checked: false, indeterminate: false },
}
