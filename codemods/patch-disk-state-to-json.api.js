/**
 * This codemod patches type failures in the generated `DiskStateToJSON`
 * function of libs/api/__generated__/models/DiskState.ts
 *
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
export default function transformer(file, api) {
  const j = api.jscodeshift

  const source = j(file.source)

  if (!file.path.endsWith('DiskState.ts')) return

  return source
    .find(j.FunctionDeclaration, { id: { name: 'DiskStateToJSON' } })
    .find(j.ReturnStatement)
    .find(j.CallExpression)
    .find(j.Identifier, { name: 'value' })
    .replaceWith(j.tsAsExpression(j.identifier('value'), j.tsAnyKeyword()))
    .toSource()
}
