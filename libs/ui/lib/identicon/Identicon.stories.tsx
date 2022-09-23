import { Identicon } from './Identicon'

export const Default = () => (
  <div className="space-y-4">
    <p>Note that similar names do not have similar icons</p>
    <div>
      <h1 className="mb-2 text-sans-xl">org1</h1>
      <Identicon name="org1" />
    </div>
    <div>
      <h1 className="mb-2 text-sans-xl">org2</h1>
      <Identicon name="org2" />
    </div>
    <div>
      <h1 className="mb-2 text-sans-xl">
        some-other-org (with <code>className</code> for styling)
      </h1>
      <Identicon
        className="flex h-[34px] w-[34px] items-center justify-center rounded bg-green-900 text-green-500"
        name="some-other-org"
      />
    </div>
  </div>
)
