import { Section } from '../../util/story-section'
import { Button, variants } from './Button'

// TODO: sizes (I guess)

// TODO: loading spinner get absolutely positioned in the page and stay where
// they are on scroll (lmao)

const states = ['normal', 'hover', 'focus', 'disabled']
export const All = () => {
  return (
    <div className="flex flex-row flex-wrap">
      {states.map((state) => (
        <Section key={state} title={state}>
          <div className="mb-2 flex flex-row space-x-2">
            {variants.map((variant) => (
              <>
                <Button key={variant} variant={variant} className={`:${state}`}>
                  {variant}
                </Button>
                <Button key={variant} variant={variant} className={`:${state}`} loading>
                  {variant}
                </Button>
              </>
            ))}
          </div>
        </Section>
      ))}
    </div>
  )
}
