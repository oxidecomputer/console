import { intersperse } from '@oxide/util'

const white = (s: string) => (
  <span key={s} className="text-default">
    {s}
  </span>
)

export const fancifyStates = (states: string[]) =>
  intersperse(states.map(white), <>, </>, <> or </>)
