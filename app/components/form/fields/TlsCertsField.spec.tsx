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

  it('matches multiple subdomains', () => {
    expect(matchesDomain('*.example.com', 'sub.sub.example.com')).toBe(true)
    expect(matchesDomain('*.example.com', 'sub.sub.sub.example.com')).toBe(true)
  })

  it('matches with case insensitivity', () => {
    expect(matchesDomain('EXAMPLE.COM', 'example.com')).toBe(true)
    expect(matchesDomain('example.com', 'EXAMPLE.COM')).toBe(true)
  })

  it('does not match incorrect wildcards', () => {
    expect(matchesDomain('test.*', 'test.com')).toBe(false)
    expect(matchesDomain('test.*', 'test.net')).toBe(false)
  })
})

describe('parseCertificate', () => {
  const validCert = `-----BEGIN CERTIFICATE-----\nMIIDbjCCAlagAwIBAgIUVF36cv2UevtKOGWP3GNV1h+TpScwDQYJKoZIhvcNAQEL\nBQAwGzEZMBcGA1UEAwwQdGVzdC5leGFtcGxlLmNvbTAeFw0yNDExMjcxNDE4MTha\nFw0yNTExMjcxNDE4MThaMBsxGTAXBgNVBAMMEHRlc3QuZXhhbXBsZS5jb20wggEi\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC0cBavU9cnrTY7CaOsHdfzr7e4\nmT7eRCGJa1jmuGeADGIs1IcMr/7jgiKS/1P69SehfqpFWXKAYn5OH+ickZfs55AB\nuyfh+KogmTkX6I40CnP9GohfgAaDVr119a2kdJNvinsCjNGfulMBYiw+sJBp4l/c\nzQRYMXaMk1ARKBgUuVZHZXnkWQKjp/GAQjVsUjl/dnBVeUuS4/0OVTLL8U6mGzdy\nf5s03bpBLOOJ9Owg1We5urYA6glCvvMh1VhBPsCnHFj6aYLnnWpJkVuJEKA+znEU\nU2n6T0bQorzVnn5ROtAn3ao4sGIVMbMeIaEvUt3zyVk+gtUvqSTPChFde6/LAgMB\nAAGjgakwgaYwHQYDVR0OBBYEFFzp73YRPxxu4bTQvmJy5rqHNXh7MB8GA1UdIwQY\nMBaAFFzp73YRPxxu4bTQvmJy5rqHNXh7MA8GA1UdEwEB/wQFMAMBAf8wUwYDVR0R\nBEwwSoIQdGVzdC5leGFtcGxlLmNvbYISKi50ZXN0LmV4YW1wbGUuY29tghEqLmRl\ndi5leGFtcGxlLmNvbYIJbG9jYWxob3N0hwR/AAABMA0GCSqGSIb3DQEBCwUAA4IB\nAQCstbMiTwHuSlwuUslV9SxewdxTtKAjNgUnCn1Jv7hs44wNTBqvMzDq2HB26wRR\nOnbt6gReOj9GdSRmJPNcgouaAGJWCXuaZPs34LgRJir6Z0FVcK7/O3SqfTOg3tJg\ngzg4xmtzXc7Im4VgvaLS5iXCOvUaKf/rXeYDa3r37EF+vyzcETt5bXwtU8BBFvVT\nJfPDla5lYv0h9Z+XsYEAqtbChdy+fVuHnF+EygZCT9KVFBPWQrsaF1Qc/CvP/+LM\nCrdLoB+2pkWbX075tv8LIbL2dW5Gzyw+lU6lzPL9Vikm3QXGRklKHA4SVuZ3F9tr\nwPRLWb4aPmo1COkgvg3Moqdw\n-----END CERTIFICATE-----`

  const invalidCert = 'not-a-certificate'

  it('parses valid certificate', () => {
    const result = parseCertificate(validCert)
    expect(result).toEqual({
      commonName: ['test.example.com'],
      subjectAltNames: [
        'test.example.com',
        '*.test.example.com',
        '*.dev.example.com',
        'localhost',
        '127.0.0.1',
      ],
      isValid: true,
    })
  })

  it('returns invalid for invalid certificate', () => {
    const result = parseCertificate(invalidCert)
    expect(result).toEqual({
      commonName: [],
      subjectAltNames: [],
      isValid: false,
    })
  })
})
