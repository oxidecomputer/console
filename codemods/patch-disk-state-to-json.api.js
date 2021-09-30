/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
export default function transformer(file, api) {
  const j = api.jscodeshift

  const source = j(file.source)

  return source
    .find(j.FunctionDeclaration, { id: { name: 'DiskStateToJSON' } })
    .find(j.ReturnStatement)
    .find(j.CallExpression)
    .find(j.Identifier, { name: 'value' })
    .replaceWith(j.tsAsExpression(j.identifier('value'), j.tsAnyKeyword()))
    .toSource()
}
