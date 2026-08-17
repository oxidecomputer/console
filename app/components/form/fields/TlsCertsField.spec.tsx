/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'

import { matchesDomain, parseCertificate } from './TlsCertsField'

describe('matchesDomain', () => {
  it('matches wildcard subdomains', () => {
    expect(matchesDomain('*.example.com', 'sub.example.com')).toBe(true)
    expect(matchesDomain('*.example.com', 'example.com')).toBe(false)
    expect(matchesDomain('*', 'any.domain')).toBe(false)
  })

  it('matches exact matches', () => {
    expect(matchesDomain('example.com', 'example.com')).toBe(true)
    expect(matchesDomain('example.com', 'www.example.com')).toBe(false)
  })

  it('only matches one level of wildcard', () => {
    expect(matchesDomain('*.example.com', 'sub.sub.example.com')).toBe(false)
    expect(matchesDomain('*.example.com', 'sub.sub.sub.example.com')).toBe(false)
  })

  it('does not match wildcard suffixes across label boundaries', () => {
    expect(matchesDomain('*.ys.example.com', 'foo.sys.example.com')).toBe(false)
  })

  it('matches with case insensitivity', () => {
    expect(matchesDomain('EXAMPLE.COM', 'example.com')).toBe(true)
    expect(matchesDomain('example.com', 'EXAMPLE.COM')).toBe(true)
    // wildcard branch must also be case-insensitive (RFC 6125 §6.4)
    expect(matchesDomain('*.SYS.EXAMPLE.COM', 'foo.sys.example.com')).toBe(true)
    expect(matchesDomain('*.sys.example.com', 'FOO.SYS.EXAMPLE.COM')).toBe(true)
  })

  it('tolerates a trailing dot in either argument', () => {
    expect(matchesDomain('example.com.', 'example.com')).toBe(true)
    expect(matchesDomain('example.com', 'example.com.')).toBe(true)
    expect(matchesDomain('*.example.com.', 'foo.example.com')).toBe(true)
  })

  it('rejects pathological "*." patterns', () => {
    // empty suffix after the wildcard would otherwise match any 2-label domain
    expect(matchesDomain('*.', 'a.b')).toBe(false)
    expect(matchesDomain('*.', 'foo.bar')).toBe(false)
  })

  it('does not match wildcards in non-leading positions', () => {
    expect(matchesDomain('test.*', 'test.com')).toBe(false)
    expect(matchesDomain('test.*.com', 'test.foo.com')).toBe(false)
    expect(matchesDomain('a.*.b.com', 'a.x.b.com')).toBe(false)
  })

  it('handles silo-style expected domains', () => {
    expect(
      matchesDomain('foo.sys.r2.oxide-preview.com', 'foo.sys.r2.oxide-preview.com')
    ).toBe(true)
    expect(
      matchesDomain('*.sys.r2.oxide-preview.com', 'foo.sys.r2.oxide-preview.com')
    ).toBe(true)
    expect(
      matchesDomain('*.sys.r2.oxide-preview.com', 'bar.sys.r2.oxide-preview.com')
    ).toBe(true)
    // wildcard must not match a sibling segment
    expect(
      matchesDomain('*.sys.r2.oxide-preview.com', 'foo.bar.r2.oxide-preview.com')
    ).toBe(false)
  })
})

describe('parseCertificate', () => {
  const validCert = `-----BEGIN CERTIFICATE-----\nMIIDbjCCAlagAwIBAgIUVF36cv2UevtKOGWP3GNV1h+TpScwDQYJKoZIhvcNAQEL\nBQAwGzEZMBcGA1UEAwwQdGVzdC5leGFtcGxlLmNvbTAeFw0yNDExMjcxNDE4MTha\nFw0yNTExMjcxNDE4MThaMBsxGTAXBgNVBAMMEHRlc3QuZXhhbXBsZS5jb20wggEi\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC0cBavU9cnrTY7CaOsHdfzr7e4\nmT7eRCGJa1jmuGeADGIs1IcMr/7jgiKS/1P69SehfqpFWXKAYn5OH+ickZfs55AB\nuyfh+KogmTkX6I40CnP9GohfgAaDVr119a2kdJNvinsCjNGfulMBYiw+sJBp4l/c\nzQRYMXaMk1ARKBgUuVZHZXnkWQKjp/GAQjVsUjl/dnBVeUuS4/0OVTLL8U6mGzdy\nf5s03bpBLOOJ9Owg1We5urYA6glCvvMh1VhBPsCnHFj6aYLnnWpJkVuJEKA+znEU\nU2n6T0bQorzVnn5ROtAn3ao4sGIVMbMeIaEvUt3zyVk+gtUvqSTPChFde6/LAgMB\nAAGjgakwgaYwHQYDVR0OBBYEFFzp73YRPxxu4bTQvmJy5rqHNXh7MB8GA1UdIwQY\nMBaAFFzp73YRPxxu4bTQvmJy5rqHNXh7MA8GA1UdEwEB/wQFMAMBAf8wUwYDVR0R\nBEwwSoIQdGVzdC5leGFtcGxlLmNvbYISKi50ZXN0LmV4YW1wbGUuY29tghEqLmRl\ndi5leGFtcGxlLmNvbYIJbG9jYWxob3N0hwR/AAABMA0GCSqGSIb3DQEBCwUAA4IB\nAQCstbMiTwHuSlwuUslV9SxewdxTtKAjNgUnCn1Jv7hs44wNTBqvMzDq2HB26wRR\nOnbt6gReOj9GdSRmJPNcgouaAGJWCXuaZPs34LgRJir6Z0FVcK7/O3SqfTOg3tJg\ngzg4xmtzXc7Im4VgvaLS5iXCOvUaKf/rXeYDa3r37EF+vyzcETt5bXwtU8BBFvVT\nJfPDla5lYv0h9Z+XsYEAqtbChdy+fVuHnF+EygZCT9KVFBPWQrsaF1Qc/CvP/+LM\nCrdLoB+2pkWbX075tv8LIbL2dW5Gzyw+lU6lzPL9Vikm3QXGRklKHA4SVuZ3F9tr\nwPRLWb4aPmo1COkgvg3Moqdw\n-----END CERTIFICATE-----`

  const invalidCert = 'not-a-certificate'

  it('parses valid certificate', () => {
    const result = parseCertificate(validCert)
    expect(result).toEqual({
      commonNames: ['test.example.com'],
      subjectAltNames: [
        'test.example.com',
        '*.test.example.com',
        '*.dev.example.com',
        'localhost',
        '127.0.0.1',
      ],
      notAfter: expect.any(Date),
      isValid: true,
    })
    expect(result.notAfter?.toISOString()).toBe('2025-11-27T14:18:18.000Z')
  })

  it('returns invalid for invalid certificate', () => {
    const result = parseCertificate(invalidCert)
    expect(result).toEqual({
      commonNames: [],
      subjectAltNames: [],
      notAfter: null,
      isValid: false,
    })
  })

  it('returns invalid for empty input', () => {
    expect(parseCertificate('')).toEqual({
      commonNames: [],
      subjectAltNames: [],
      notAfter: null,
      isValid: false,
    })
  })

  it('returns invalid for binary garbage', () => {
    // simulates a non-PEM file (e.g. PNG) read as text
    const garbage = '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR'
    expect(parseCertificate(garbage)).toEqual({
      commonNames: [],
      subjectAltNames: [],
      notAfter: null,
      isValid: false,
    })
  })

  it('parses the leaf when given a chain (multi-PEM bundle)', () => {
    // leaf + a second cert appended; we should parse the leaf only
    const chain = `${validCert}\n${validCert}`
    const result = parseCertificate(chain)
    expect(result.isValid).toBe(true)
    expect(result.commonNames).toEqual(['test.example.com'])
  })

  it('tolerates leading whitespace and BOM', () => {
    const wrapped = `﻿  \n\t${validCert}\n\n`
    const result = parseCertificate(wrapped)
    expect(result.isValid).toBe(true)
    expect(result.commonNames).toEqual(['test.example.com'])
  })
})
