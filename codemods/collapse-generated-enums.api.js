/**
 * This codemod flattens the disk states referenced from files like
 * `libs/api/__generated__/models/DiskState.ts` to ensure they result
 * in a discriminable union instead of a union of single member enums
 *
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
export default function transformer(file, api) {
  const j = api.jscodeshift
  const source = j(file.source)
  let stateName = ''
  let enumName = ''

  if (file.path.includes('__generated__') && file.path.includes('OneOf')) {
    source
      .find(j.ExportNamedDeclaration, {
        declaration: { type: 'TSEnumDeclaration' },
      })
      .forEach((path) => {
        enumName = path.value.declaration.id.name
        stateName = path.value.declaration.members[0].initializer.value
        if (!enumName || !stateName) {
          throw new Error(`Transform failed for ${file.path}`)
        }
      })
      .remove()

    return source
      .find(j.Identifier, { name: enumName })
      .replaceWith(j.literal(stateName))
      .toSource()
  }
}
