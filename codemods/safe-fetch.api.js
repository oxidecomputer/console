/**
 * This codemod patches the open-api's generated `runtime.ts` file
 * to ensure the member property `get fetchApi` returns a valid fetch
 * function.
 *
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
export default function transformer(file, api) {
  const j = api.jscodeshift
  const source = j(file.source)

  if (!file.path.endsWith('runtime.ts')) return

  return source
    .find(j.ClassMethod, { key: { name: 'fetchApi' } })
    .find(j.ReturnStatement)
    .replaceWith((r) =>
      j.returnStatement(
        j.logicalExpression('||', r.value.argument, j.identifier('fetch'))
      )
    )
    .toSource()
}
