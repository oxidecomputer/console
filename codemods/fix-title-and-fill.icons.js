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

  const iconName = path
    .basename(file.path, '.tsx')
    .replace(/([A-Za-z]+)[A-Z0-9]\w*Icon/, '$1')

  // Remove fill=none
  source
    .find(j.JSXAttribute, { name: { name: 'fill' }, value: { value: 'none' } })
    .replaceWith()

  // Replace other fill w/ fill="currentColor"
  source
    .find(j.JSXAttribute, { name: { name: 'fill' } })
    .find(j.Literal)
    .replaceWith(j.literal('currentColor'))

  // Add default title
  return source
    .find(j.FunctionDeclaration)
    .find(j.ObjectPattern)
    .find(j.Identifier, { name: 'title' })
    .filter((p) => p.name === 'value')
    .replaceWith((r) => j.assignmentPattern(r.value, j.literal(iconName)))
    .toSource()
}
