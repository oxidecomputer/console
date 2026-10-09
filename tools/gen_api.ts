/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/**
 * Generate everything in app/api/__generated__ from omicron at the commit in
 * OMICRON_VERSION. __generated__/OMICRON_VERSION is written last, so a safety
 * test catches a run that didn't finish.
 *
 * Timeseries metadata takes a request per schema file, so it's skipped when
 * the outputs are already stamped with the pinned commit. Pass --force to
 * regenerate it anyway. The API client is never skipped because upgrading
 * openapi-gen-ts can change it without a pin bump.
 *
 * Usage: npm run gen-api [-- --force]
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import * as R from 'remeda'
import { parse as parseToml } from 'smol-toml'
import * as z from 'zod'

const ROOT = path.resolve(import.meta.dirname, '..')
const GEN_DIR = path.join(ROOT, 'app/api/__generated__')
const STAMP_FILE = path.join(GEN_DIR, 'OMICRON_VERSION')
const BIN = path.join(ROOT, 'node_modules/.bin')

const HEADER = `/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
`

const sha = fs.readFileSync(path.join(ROOT, 'OMICRON_VERSION'), 'utf8').trim()

/** The commit the current outputs were generated from, if any */
const stampedSha = fs.existsSync(STAMP_FILE)
  ? fs
      .readFileSync(STAMP_FILE, 'utf8')
      .split('\n')
      .find((line) => line && !line.startsWith('#'))
  : undefined

async function fetchOk(url: string, headers?: Record<string, string>) {
  const response = await fetch(url, { headers })
  if (!response.ok) throw new Error(`${response.status} fetching ${url}`)
  return response
}

/** Fetch a file from the omicron repo at the pinned commit */
const fetchOmicronFile = (filePath: string) =>
  fetchOk(
    `https://raw.githubusercontent.com/oxidecomputer/omicron/${sha}/${filePath}`
  ).then((r) => r.text())

const writeGenerated = (file: string, contents: string) =>
  fs.writeFileSync(path.join(GEN_DIR, file), `${HEADER}\n${contents}`)

//////////////////////////////
// API client
//////////////////////////////

/** Generate the client from the Nexus OpenAPI spec. Returns the API version. */
async function generateApiClient() {
  // nexus-latest.json is a symlink, so fetching it gets the target's filename
  const specName = (await fetchOmicronFile('openapi/nexus/nexus-latest.json')).trim()
  const specText = await fetchOmicronFile(`openapi/nexus/${specName}`)
  const specFile = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-spec-')),
    specName
  )
  fs.writeFileSync(specFile, specText)

  // use the version of the generator in dev deps
  execFileSync(path.join(BIN, 'openapi-gen-ts'), [specFile, GEN_DIR, '--features', 'msw'], {
    stdio: 'inherit',
  })
  for (const file of ['Api.ts', 'msw-handlers.ts', 'validate.ts']) {
    writeGenerated(file, fs.readFileSync(path.join(GEN_DIR, file), 'utf8'))
  }

  const spec: { info: { version: string } } = JSON.parse(specText)
  return spec.info.version
}

//////////////////////////////
// Timeseries metadata
//////////////////////////////

const TIMESERIES_FILE = 'timeseries-metadata.ts'
const SCHEMA_DIR = 'oximeter/oximeter/schema'

// fields are listed per version; we only care about the latest
const Versioned = z.object({
  versions: z.array(z.object({ fields: z.array(z.string()) })).min(1),
})
type Versioned = z.infer<typeof Versioned>

// Units, datum types, and field types stay plain strings here because tsc
// checks them against the API enums in the generated file
const SchemaToml = z.object({
  target: Versioned.extend({ name: z.string(), description: z.string() }),
  metrics: z.array(
    Versioned.extend({
      name: z.string(),
      description: z.string(),
      units: z.string(),
      datum_type: z.string(),
    })
  ),
  fields: z.record(z.string(), z.object({ type: z.string(), description: z.string() })),
})
type SchemaToml = z.infer<typeof SchemaToml>

/**
 * Snapshot timeseries descriptions and units from the oximeter schema TOML
 * files. The schema list endpoint can't give us these because the ClickHouse
 * schema table doesn't store them, so Nexus returns empty descriptions and
 * `none` units for everything.
 */
async function generateTimeseriesMetadata() {
  const upToDate = stampedSha === sha && fs.existsSync(path.join(GEN_DIR, TIMESERIES_FILE))
  if (upToDate && !process.argv.includes('--force')) {
    console.info(`timeseries metadata already generated for ${sha}, skipping`)
    return
  }

  // a token is optional, but avoids the low unauthenticated rate limit
  const ghHeaders: Record<string, string> = process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}

  const listing: { name: string; download_url: string }[] = await fetchOk(
    `https://api.github.com/repos/oxidecomputer/omicron/contents/${SCHEMA_DIR}?ref=${sha}`,
    ghHeaders
  ).then((r) => r.json())

  const tomlFiles = listing.filter((f) => f.name.endsWith('.toml'))
  const schemas = await Promise.all(
    tomlFiles.map(async (f) => {
      const text = await fetchOk(f.download_url).then((r) => r.text())
      const result = SchemaToml.safeParse(parseToml(text))
      if (!result.success) {
        throw new Error(`Invalid schema in ${f.name}:\n${z.prettifyError(result.error)}`)
      }
      return { file: path.basename(f.name, '.toml'), ...result.data }
    })
  )

  const latestFields = (
    file: string,
    fields: SchemaToml['fields'],
    { versions }: Versioned
  ) =>
    versions[versions.length - 1].fields.map((name) => {
      const field = fields[name]
      if (!field)
        throw new Error(`${file}.toml: field "${name}" is not defined in [fields]`)
      return { name, fieldType: field.type, description: field.description }
    })

  // Target fields are shared by every metric on the target, so they're stored
  // once per target instead of being repeated on each timeseries. Targets are
  // keyed by schema file because two files can define different targets with
  // the same name (e.g., virtual_machine).
  const targets = R.pipe(
    schemas,
    R.sortBy((s) => s.file),
    R.mapToObj(({ file, target, fields }) => [
      file,
      { description: target.description, fields: latestFields(file, fields, target) },
    ])
  )

  const timeseries = R.pipe(
    schemas,
    R.flatMap(({ file, target, metrics, fields }) =>
      metrics.map((metric) => ({
        name: `${target.name}:${metric.name}`,
        target: file,
        description: metric.description,
        units: metric.units,
        datumType: metric.datum_type,
        fields: latestFields(file, fields, metric),
      }))
    ),
    R.sortBy((t) => t.name),
    R.mapToObj(({ name, ...rest }) => [name, rest])
  )

  writeGenerated(
    TIMESERIES_FILE,
    `// generated by tools/gen_api.ts from the oximeter schema TOML files in
// omicron. do not update manually. see docs/update-pinned-api.md

import type { DatumType, FieldSchema, Units } from './Api'

type Field = Omit<FieldSchema, 'source'>

export const targets: Partial<Record<string, { description: string; fields: Field[] }>> =
  ${JSON.stringify(targets)}

export const timeseries: Partial<
  Record<
    string,
    {
      /** key into \`targets\` */
      target: string
      description: string
      units: Units
      datumType: DatumType
      fields: Field[]
    }
  >
> = ${JSON.stringify(timeseries)}
`
  )

  console.info(
    `wrote ${Object.keys(timeseries).length} timeseries from ${tomlFiles.length} files to ${TIMESERIES_FILE}`
  )
}

//////////////////////////////
// How Nexus serves the console
//////////////////////////////

const NEXUS_CONSOLE_FILE = 'nexus-console.ts'
const CONSOLE_API_PATH = 'nexus/src/external_api/console_api.rs'
const HANDLERS_PATH = 'nexus/src/external_api/http_entrypoints.rs'
const ENDPOINTS_PATH = 'nexus/external-api/src/lib.rs'

/**
 * Snapshot from the Rust source:
 *
 * - The security headers Nexus serves the console with, including the CSP, so
 *   dev and preview servers can serve the console under the same policy.
 * - The paths Nexus serves the console's index.html on. These endpoints are
 *   unpublished, so they aren't in the OpenAPI spec. A test checks that every
 *   console route is covered, so a new top-level route can't ship without
 *   Nexus serving it.
 */
async function generateNexusConsole() {
  const [consoleApi, handlers, endpoints] = await Promise.all([
    fetchOmicronFile(CONSOLE_API_PATH),
    fetchOmicronFile(HANDLERS_PATH),
    fetchOmicronFile(ENDPOINTS_PATH),
  ])

  // https://github.com/oxidecomputer/omicron/blob/7e18e52/nexus/src/external_api/console_api.rs#L323-L334
  const headersBlock = consoleApi.match(
    /WEB_SECURITY_HEADERS: \[\(HeaderName, HeaderValue\); (\d+)\] = \[([\s\S]*?)\n\];/
  )
  if (!headersBlock)
    throw new Error(`Could not find security headers in ${CONSOLE_API_PATH}`)
  const securityHeaders = Array.from(
    headersBlock[2].matchAll(
      /http::header::(\w+),\s*HeaderValue::from_static\(\s*"([^"]*)"/g
    ),
    ([, name, literal]) => {
      // A Rust string continuation (backslash-newline) also skips the next
      // line's leading whitespace. Any other escape means the source changed shape.
      const value = literal.replace(/\\\n\s*/g, '')
      if (value.includes('\\')) throw new Error(`Unexpected escape in ${name}: ${value}`)
      // the http crate names header constants by uppercasing the header name
      return [name.toLowerCase().replaceAll('_', '-'), value] as const
    }
  )
  // guard against a source change that makes the extraction silently miss things
  if (securityHeaders.length !== Number(headersBlock[1])) {
    throw new Error(
      `Expected ${headersBlock[1]} security headers, found ${securityHeaders.length}`
    )
  }
  if (!securityHeaders.some(([name]) => name === 'content-security-policy')) {
    throw new Error(
      `Expected a CSP among ${securityHeaders.map(([name]) => name).join(', ')}`
    )
  }

  // The handler impls are where we can tell which endpoints serve the console:
  // they call one of these two functions.
  // https://github.com/oxidecomputer/omicron/blob/7e18e52/nexus/src/external_api/console_api.rs#L239
  // https://github.com/oxidecomputer/omicron/blob/7e18e52/nexus/src/external_api/console_api.rs#L428
  const consoleHandlers = handlers
    .split(/\basync fn /)
    .slice(1)
    .filter((chunk) =>
      /\b(serve_console_index|console_index_or_login_redirect)\(/.test(chunk)
    )
    .map((chunk) => chunk.match(/^\w+/)![0]) // split point is always followed by a name

  // The paths are in the endpoint attributes on the API trait. Paths contain
  // braces, so match up to the attribute's closing `}]` without crossing one.
  const endpointPaths = new Map(
    Array.from(
      endpoints.matchAll(/#\[endpoint\s*\{((?:(?!\}\])[\s\S])*)\}\]\s*async fn (\w+)/g),
      ([, attrs, name]) => [name, attrs.match(/\bpath\s*=\s*"([^"]+)"/)?.[1]]
    )
  )

  const routes = consoleHandlers.map((name) => {
    const route = endpointPaths.get(name)
    if (!route) throw new Error(`Could not find path for ${name} in ${ENDPOINTS_PATH}`)
    return route
  })
  // guard against a source change that makes the extraction silently miss things
  if (!routes.includes('/')) throw new Error(`Expected / in ${routes.join(', ')}`)
  routes.sort()

  writeGenerated(
    NEXUS_CONSOLE_FILE,
    `// generated by tools/gen_api.ts from the Nexus source in omicron.
// do not update manually. see docs/update-pinned-api.md

/** Security headers Nexus serves the console with, including the CSP */
export const nexusSecurityHeaders = ${JSON.stringify(Object.fromEntries(securityHeaders))}

/** Dropshot path templates that Nexus serves the console's index.html on */
export const nexusConsoleRoutes = ${JSON.stringify(routes)}
`
  )

  console.info(
    `wrote Nexus security headers and ${routes.length} console routes to ${NEXUS_CONSOLE_FILE}`
  )
}

//////////////////////////////
// Run
//////////////////////////////

const apiVersion = await generateApiClient()
await generateTimeseriesMetadata()
await generateNexusConsole()

execFileSync(path.join(BIN, 'oxfmt'), [GEN_DIR], { stdio: 'inherit' })

// Standalone copy of the API version so other tooling (e.g., omicron releng)
// can read it without parsing Api.ts. Bare version string with no comment line
// to keep it trivial to consume.
fs.writeFileSync(path.join(GEN_DIR, 'API_VERSION'), `${apiVersion}\n`)

fs.writeFileSync(
  STAMP_FILE,
  `# generated file. do not update manually. see docs/update-pinned-api.md\n${sha}\n`
)
