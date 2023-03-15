import { Truncate } from './Truncate'

export const Default = () => (
  <div className="space-y-4">
    <Truncate text="document.getElementById(foo).innerHTML" maxLength={30} />
    <Truncate
      text="document.getElementById(foo).innerHTML"
      maxLength={30}
      position="middle"
    />
    <Truncate
      text="document.getElementById(foo).innerHTML"
      maxLength={30}
      position="middle"
      hasCopyButton
    />
    <Truncate text="document.getElementById(foo).innerHTML" maxLength={100} />
  </div>
)
