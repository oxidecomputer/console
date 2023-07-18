/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/**
 * This codemod removes hardcoded widths and heights from
 * responsive icons and replaces them with a viewBox
 *
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
export default function transformer(file, api) {
  const j = api.jscodeshift
  const source = j(file.source)

  if (!file.path.endsWith('.tsx') || !file.path.toLowerCase().includes('responsive')) return

  // Grab width value and remove width prop
  const widthProp = source.find(j.JSXAttribute, { name: { name: 'width' } })
  const width = widthProp.find(j.NumericLiteral).get('value').value
  widthProp.remove()

  // Grab height value and remove height prop
  const heightProp = source.find(j.JSXAttribute, { name: { name: 'height' } })
  const height = heightProp.find(j.NumericLiteral).get('value').value
  heightProp.remove()

  // Insert viewBox into attribute list
  return source
    .find(j.JSXOpeningElement, { name: { name: 'svg' } })
    .map((s) => {
      s.node.attributes.unshift(
        j.jsxAttribute(j.jsxIdentifier('viewBox'), j.literal(`0 0 ${width} ${height}`))
      )
    })
    .toSource()
}
