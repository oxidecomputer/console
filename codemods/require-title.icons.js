import path from 'path'

/**
 * This codemod adds a default title to the svg exports
 * accessibility purposes
 *
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
export default function transformer(file, api) {
  const j = api.jscodeshift
  const source = j(file.source)

  if (!file.path.endsWith('.tsx')) return

  return source
    .find(j.FunctionDeclaration)
    .find(j.ObjectPattern)
    .find(j.Identifier, { name: 'title' })
    .filter((p) => p.name === 'value')
    .replaceWith((r) =>
      j.assignmentPattern(
        r.value,
        j.literal(
          path.basename(file.path, '.tsx').replace(/(.*)[A-Z]\w+Icon/, '$1')
        )
      )
    )
    .toSource()
}
