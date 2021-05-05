// This file mostly follows the recommendations in the twin.macro example repo
// for React + styled-components. See below for the exception.
// https://github.com/ben-rogerson/twin.examples/tree/0cc4c8/react-styled-components#complete-the-typescript-setup

import 'twin.macro'
import type styledImport from 'styled-components'
import type { css as cssImport } from 'styled-components'
// import type { CSSProp } from 'styled-components'

declare module 'twin.macro' {
  const styled: typeof styledImport
  const css: typeof cssImport
}

declare global {
  namespace JSX {
    interface IntrinsicAttributes<T> extends DOMAttributes<T> {
      as?: string | Element
    }
  }
}

// The TypeScript setup instructions includes the following bit to type the css
// prop, but it conflicts with the Emotion type for the css prop which is
// polluting the global namespace (we're not the only ones with this problem:
// https://github.com/emotion-js/emotion/issues/1800). The Emotion types are
// only around because Storybook relies on them. This was apparently fixed in
// Emotion v11 (https://github.com/emotion-js/emotion/pull/1941) but all the
// Storybook stuff is still pointing at v10. Anyway, if we leave the recommended
// bit out, there's no conflict because we're falling back to Emotion's types,
// which is a little weird because we're using styled-components, but it seems
// to work fine. All this is just one more point in favor of switching to
// Emotion, which makes this problem disappear.

// declare module 'react' {
//   interface HTMLAttributes<T> extends DOMAttributes<T> {
//     css?: CSSProp
//   }
//   interface SVGProps<T> extends SVGProps<SVGSVGElement> {
//     css?: CSSProp
//   }
// }
