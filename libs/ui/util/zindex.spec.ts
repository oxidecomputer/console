import { describe, expect, it } from 'vitest'

import { getDropdownZIndex } from './zindex'

describe('getDropdownZIndex', () => {
  it('returns modalDropdown value when isInModal is true', () => {
    expect(getDropdownZIndex(true, false)).toEqual('z-50')
    // for completeness, though this should never happen
    expect(getDropdownZIndex(true, true)).toEqual('z-50')
  })
  it('returns sideModalDropdown value when isInModal is false but isInSideModal is true', () => {
    expect(getDropdownZIndex(false, true)).toEqual('z-40')
  })
  it('returns contentDropdown value when isInModal and isInSideModal are false', () => {
    expect(getDropdownZIndex(false, false)).toEqual('z-10')
  })
})
