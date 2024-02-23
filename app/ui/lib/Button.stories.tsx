/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Section } from '../util/story-section'
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
