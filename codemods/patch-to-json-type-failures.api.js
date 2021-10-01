import path from 'path'
import fs from 'fs'

/**
 *
 * @param {import('jscodeshift').FunctionDeclaration} funcDeclaration
 */
const ToJSONFunctionFilter = (funcDeclaration) => {
  return funcDeclaration.id.name.endsWith('ToJSON')
}

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
  const dir = path.dirname(file.path)
  const filename = path.basename(file.path, '.ts')

  if (fs.existsSync(path.join(dir, `${filename}OneOf.ts`))) {
    return source
      .find(j.FunctionDeclaration, ToJSONFunctionFilter)
      .find(j.ReturnStatement)
      .find(j.CallExpression)
      .find(j.Identifier, { name: 'value' })
      .replaceWith(j.tsAsExpression(j.identifier('value'), j.tsAnyKeyword()))
      .toSource()
  }
}
