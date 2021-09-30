/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
const transformer = (file, api) => {
  const j = api.jscodeshift
  const source = j(file.source)
  let stateName = ''
  let enumName = ''

  if (
    file.path.includes('__generated__') &&
    file.path.includes('DiskStateOneOf')
  ) {
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

export default transformer
