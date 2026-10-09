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
import { parse } from 'smol-toml'

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
type Versioned = { versions: { fields: string[] }[] }

type SchemaToml = {
  target: Versioned & { name: string; description: string }
  metrics: (Versioned & {
    name: string
    description: string
    units: string
    datum_type: string
  })[]
  fields: Record<string, { type: string; description: string }>
}

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
      return {
        file: path.basename(f.name, '.toml'),
        ...(parse(text) as unknown as SchemaToml),
      }
    })
  )

  const latestFields = (fields: SchemaToml['fields'], { versions }: Versioned) =>
    versions[versions.length - 1].fields.map((name) => ({
      name,
      fieldType: fields[name].type,
      description: fields[name].description,
    }))

  // Target fields are shared by every metric on the target, so they're stored
  // once per target instead of being repeated on each timeseries. Targets are
  // keyed by schema file because two files can define different targets with
  // the same name (e.g., virtual_machine).
  const targets = R.pipe(
    schemas,
    R.sortBy((s) => s.file),
    R.mapToObj(({ file, target, fields }) => [
      file,
      { description: target.description, fields: latestFields(fields, target) },
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
        fields: latestFields(fields, metric),
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
// Run
//////////////////////////////

const apiVersion = await generateApiClient()
await generateTimeseriesMetadata()

execFileSync(path.join(BIN, 'oxfmt'), [GEN_DIR], { stdio: 'inherit' })

// Standalone copy of the API version so other tooling (e.g., omicron releng)
// can read it without parsing Api.ts. Bare version string with no comment line
// to keep it trivial to consume.
fs.writeFileSync(path.join(GEN_DIR, 'API_VERSION'), `${apiVersion}\n`)

fs.writeFileSync(
  STAMP_FILE,
  `# generated file. do not update manually. see docs/update-pinned-api.md\n${sha}\n`
)
