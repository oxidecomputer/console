import { Spinner, sizes, variants } from './Spinner'

export const Default = () => (
  <div className="space-y-2">
    {sizes.map((size) => (
      <div key={size} className="flex flex-row flex-wrap space-x-2">
        {variants.map((variant) => (
          <Spinner key={size + variant} size={size} variant={variant} />
        ))}
      </div>
    ))}
  </div>
)
