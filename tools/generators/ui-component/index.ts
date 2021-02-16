import { Tree, formatFiles, installPackagesTask } from '@nrwl/devkit'
import { componentGenerator } from '@nrwl/react'

const REPLACE_EXPORT_REGEX = /^export function (\w*)(\(props: \w*\)) {$/gm

const replaceExportFunction = async (host: Tree) => {
  const files = new Set(
    host.listChanges().filter((file) => file.type !== 'DELETE')
  )

  return Promise.all(
    Array.from(files).map(async (file) => {
      const content = file.content.toString()
      try {
        host.write(
          file.path,
          content.replace(REPLACE_EXPORT_REGEX, 'export const $1 = $2 => {')
        )
      } catch (e) {
        console.warn(
          `Could not replace exports for ${file.path}. Error: ${e.message}`
        )
      }
    })
  )
}

export default async function (host: Tree, schema: any) {
  await componentGenerator(host, {
    pascalCaseFiles: true,
    style: 'styled-components',
    name: schema.name,
    project: 'ui',
  })
  await replaceExportFunction(host)
  await formatFiles(host)
  return () => {
    installPackagesTask(host)
  }
}
