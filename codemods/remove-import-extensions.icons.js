/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/**
 * This codemod removes explictly `.tsx` extensions left by
 * figma-export index.ts generated files.
 *
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
export default function transformer(file, api) {
  const j = api.jscodeshift
  const source = j(file.source)

  if (!file.path.endsWith('index.ts')) return

  return source
    .find(j.ExportNamedDeclaration)
    .find(j.Literal)
    .replaceWith((r) => j.literal(r.value.value.replace('.tsx', '')))
    .toSource()
}
