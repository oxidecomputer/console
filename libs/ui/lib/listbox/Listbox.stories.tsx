import { Listbox } from './Listbox'

const SAMPLE_OPTIONS = [
  { value: 'de', label: 'Devon Edwards' },
  { value: 'rm', label: 'Randall Miles' },
  { value: 'cj', label: 'Connie Jones' },
  { value: 'eb', label: 'Esther Black' },
  { value: 'sf', label: 'Shane Flores' },
  { value: 'dh', label: 'Darrell Howard' },
  { value: 'jp', label: 'Jacob Pena' },
  { value: 'nm', label: 'Nathan Mckinney' },
  { value: 'br', label: 'Bessie Robertson' },
]

export const Default = () => (
  <div className="max-w-lg">
    <Listbox
      defaultValue="de"
      items={SAMPLE_OPTIONS}
      name="favorite-animal"
      placeholder="Select an animal"
      onChange={(val) => console.log(val)}
    />
  </div>
)

export const WithError = () => (
  <div className="max-w-lg">
    <Listbox
      items={SAMPLE_OPTIONS}
      name="favorite-animal"
      placeholder="Select an animal"
      hasError
    />
  </div>
)
