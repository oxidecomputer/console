/**
 *
 * @param {import('jscodeshift').FunctionDeclaration} funcDeclaration
 */
const ToJSONFunctionFilter = (funcDeclaration) => {
  return funcDeclaration.id.name.endsWith('ToJSON')
}

/**
 *
 * @param {import('jscodeshift').ReturnStatement} retStatement
 */
const ReturnsObjectSpread = (retStatement) => {
  return (
    retStatement.argument.type === 'ObjectExpression' &&
    retStatement.argument.properties.every((p) => p.type === 'SpreadElement')
  )
}

/**
 * This codemod patches type failures in the generated functions like
 * `DiskStateToJSON` of `libs/api/__generated__/models/DiskState.ts`
 *
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
export default function transformer(file, api) {
  const j = api.jscodeshift
  const source = j(file.source)

  return source
    .find(j.FunctionDeclaration, ToJSONFunctionFilter)
    .find(j.ReturnStatement, ReturnsObjectSpread)
    .find(j.CallExpression)
    .find(j.Identifier, { name: 'value' })
    .replaceWith(j.tsAsExpression(j.identifier('value'), j.tsAnyKeyword()))
    .toSource()
}
