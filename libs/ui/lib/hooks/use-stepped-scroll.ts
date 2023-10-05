/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { RefObject } from 'react'
import { useEffect } from 'react'

// appreciate this. I suffered

/**
 * While paging through elements in a list one by one, scroll just far enough to
 * the selected item in view. Outer container is the one that scrolls. The inner
 * container does not scroll, it moves inside the outer container.
 */
export function useSteppedScroll(
  outerContainerRef: RefObject<HTMLElement>,
  innerContainerRef: RefObject<HTMLElement>,
  selectedIdx: number,
  outerContainerHeight: number,
  itemSelector = 'li'
) {
  useEffect(() => {
    const outer = outerContainerRef.current
    const inner = innerContainerRef.current
    // rather than put refs on all the li, get item by index using the ul ref
    const item = inner?.querySelectorAll(itemSelector)[selectedIdx]
    if (outer && inner && item) {
      // absolute top and bottom of scroll container in viewport. annoyingly,
      // the div's bounding client rect bottom is the real bottom, including the
      // the part that's scrolled out of view. what we want is the bottom of the
      // part that's in view
      const outerTop = outer.getBoundingClientRect().top
      const outerBottom = outerTop + outerContainerHeight

      // absolute top and bottom of list and item in viewport. outer stays where
      // it is, inner moves within it
      const { top: itemTop, bottom: itemBottom } = item.getBoundingClientRect()
      const { top: innerTop } = inner.getBoundingClientRect()

      // when we decide whether the item we're scrolling to is in view already
      // or not, we need to compare absolute positions, i.e., is this item
      // inside the visible rectangle or not
      const shouldScrollUp = itemTop < outerTop
      const shouldScrollDown = itemBottom > outerBottom

      // this probably the most counterintuitive part. now we're trying to tell
      // the scrolling container how far to scroll, so we need the position of
      // the item relative to the top of the full list (innerTop), not relative
      // to the absolute y-position of the top of the visible scrollPort
      // (outerTop)
      const itemTopScrollTo = itemTop - innerTop - 1
      const itemBottomScrollTo = itemBottom - innerTop

      if (shouldScrollUp) {
        // when scrolling up, scroll to the top of the item you're scrolling to.
        // -1 is for top outline
        // -32 compensates for the height of the position: sticky <h3>
        outer.scrollTo({ top: itemTopScrollTo - 1 - 32 })
      } else if (shouldScrollDown) {
        // when scrolling down, we want to scroll just far enough so the bottom
        // edge of the selected item is in view. Because scrollTo is about the
        // *top* edge of the scrolling container, that means we scroll to
        // LIST_HEIGHT *above* the bottom edge of the item. +2 is for top *and*
        // bottom outline
        outer.scrollTo({ top: itemBottomScrollTo - outerContainerHeight + 2 })
      }
    }
    // don't depend on the refs because they get nuked on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outerContainerHeight, selectedIdx, itemSelector])
}
