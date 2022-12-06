import { Spinner, spinnerSizes, spinnerVariants } from './Spinner'

export const Default = () => (
  <div className="space-y-2">
    {spinnerSizes.map((size) => (
      <div key={size} className="flex flex-row flex-wrap space-x-2">
        {spinnerVariants.map((variant) => (
          <Spinner key={size + variant} size={size} variant={variant} />
        ))}
      </div>
    ))}
  </div>
)
