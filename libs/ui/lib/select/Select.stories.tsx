import { Item } from 'react-stately'

import { ComboBox } from './ComboBox'
import { Select } from './Select'

export const Default = () => (
  <div className="space-y-12">
    <div className="max-w-lg">
      <Select
        label="Favorite animal"
        name="favorite-animal"
        placeholder="Select an animal"
        onSelectionChange={(val) => console.log(val)}
      >
        {items.map((item) => (
          <Item key={item}>{item}</Item>
        ))}
      </Select>
    </div>

    <div className="max-w-lg">
      <ComboBox
        label="Favorite animal"
        name="favorite-animal"
        placeholder="Select an animal"
        onSelectionChange={(val) => console.log(val)}
      >
        {items.map((item) => (
          <Item key={item}>{item}</Item>
        ))}
      </ComboBox>
    </div>
  </div>
)

export const WithError = () => (
  <Select
    label="Favorite animal"
    name="favorite-animal"
    placeholder="Select an animal"
    hasError
  >
    {items.map((item) => (
      <Item key={item}>{item}</Item>
    ))}
  </Select>
)

const items = [
  'Red Panda',
  'Cat',
  'Dog',
  'Aardvark',
  'Kangaroo',
  'Snake',
  'Elephant',
  'Tiger',
  'Lion',
  'Giraffe',
  'Penguin',
  'Zebra',
  'Monkey',
  'Dolphin',
  'Bear',
  'Owl',
  'Horse',
  'Fox',
  'Koala',
  'Rabbit',
]
