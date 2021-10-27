/**
 * This codemod marks svg titles as required for
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
    .find(j.TSPropertySignature, { key: { name: 'title' } })
    .forEach((p) => {
      p.value.optional = false
    })
    .toSource()
}
