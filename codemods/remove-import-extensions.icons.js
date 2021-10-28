/**
 * This codemod removes explictly `.tsx` extensions left by
 * figma-export index.ts generated files.
 *
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
export default function transformer(file, api) {
  const j = api.jscodeshift
  const source = j(file.source)

  if (!file.path.endsWith('index.ts')) return

  return source
    .find(j.ExportNamedDeclaration)
    .find(j.Literal)
    .replaceWith((r) => j.literal(r.value.value.replace('.tsx', '')))
    .toSource()
}
