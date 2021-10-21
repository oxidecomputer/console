import { FormikDecorator } from '../../util/formik-decorator'
import { Radio } from './Radio'

export default {
  component: Radio,
  argTypes: {
    checked: { control: 'boolean' },
    children: { control: 'text' },
  },
  decorators: [FormikDecorator()],
}

export const Unchecked = {
  args: {
    checked: false,
    children: 'Label',
  },
}

export const Checked = {
  args: { checked: true, children: 'Label' },
}

export const Disabled = {
  args: { checked: false, children: 'Label', disabled: true },
}
