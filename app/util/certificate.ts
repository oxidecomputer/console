/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { SubjectAlternativeNameExtension, X509Certificate } from '@peculiar/x509'

const PEM_BLOCKS_RE = /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g

export type ParsedCert = {
  subject: string
  issuer: string
  /** DNS names from the SAN extension, falling back to CN when there are none */
  domains: string[]
  notBefore: Date
  notAfter: Date
  serialNumber: string
  /** colon-separated uppercase hex, the format browsers and openssl show */
  sha256Fingerprint: string
  keyAlgorithm: string
  selfSigned: boolean
}

const toHex = (buf: ArrayBuffer) =>
  Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0').toUpperCase())

function describeKey(alg: Algorithm & { namedCurve?: string; modulusLength?: number }) {
  if (alg.namedCurve) return `${alg.name} ${alg.namedCurve}`
  if (alg.modulusLength) return `${alg.name} ${alg.modulusLength}-bit`
  return alg.name
}

async function parseOne(pem: string): Promise<ParsedCert> {
  const cert = new X509Certificate(pem)
  const sans = cert.getExtension(SubjectAlternativeNameExtension)?.names.items ?? []
  const domains =
    sans.length > 0 ? sans.map((n) => n.value) : cert.subjectName.getField('CN')
  return {
    subject: cert.subject,
    issuer: cert.issuer,
    domains,
    notBefore: cert.notBefore,
    notAfter: cert.notAfter,
    serialNumber: cert.serialNumber,
    sha256Fingerprint: toHex(await cert.getThumbprint('SHA-256')).join(':'),
    keyAlgorithm: describeKey(cert.publicKey.algorithm),
    selfSigned: cert.subject === cert.issuer,
  }
}

/**
 * Parse every cert in a PEM chain, leaf first by convention. Returns null if
 * there are no PEM blocks or any block fails to parse.
 */
export async function parseCertChain(pem: string): Promise<ParsedCert[] | null> {
  const blocks = pem.match(PEM_BLOCKS_RE)
  if (!blocks) return null
  try {
    return await Promise.all(blocks.map(parseOne))
  } catch {
    return null
  }
}
