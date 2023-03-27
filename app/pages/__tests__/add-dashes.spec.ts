import { addDashes } from '../DeviceAuthVerifyPage'

test('addDashes', () => {
  expect(addDashes([], 'abcdefgh')).toEqual('abcdefgh')
  expect(addDashes([3], 'abcdefgh')).toEqual('abcd-efgh')
  expect(addDashes([2, 5], 'abcdefgh')).toEqual('abc-def-gh')
  // too-high idxs are ignored
  expect(addDashes([7], 'abcd')).toEqual('abcd')
})
