/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'

import { loginUrl } from '../nav-to-login'

describe('loginUrl', () => {
  describe('no options', () => {
    it('leaves off state param', () => {
      expect(loginUrl()).toEqual('/login')
    })
  })

  describe('includeCurrent = false', () => {
    it('leaves off state param', () => {
      expect(loginUrl({ includeCurrent: false })).toEqual('/login')
    })
  })

  describe('includeCurrent = true', () => {
    it('includes state param', () => {
      window.history.pushState({}, '', '/abc/def')
      expect(loginUrl({ includeCurrent: true })).toEqual('/login?redirect_uri=%2Fabc%2Fdef')
    })

    it('includes query params from redirect url', () => {
      window.history.pushState({}, '', '/abc/def?query=hi&x=y')
      expect(loginUrl({ includeCurrent: true })).toEqual(
        '/login?redirect_uri=%2Fabc%2Fdef%3Fquery%3Dhi%26x%3Dy'
      )
    })
  })
})
