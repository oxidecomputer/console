import { Tree, formatFiles, installPackagesTask } from '@nrwl/devkit'
import { componentGenerator, componentStoryGenerator } from '@nrwl/react'
import * as path from 'path'

const REPLACE_EXPORT_REGEX = /^export function (\w+)\(props: (\w+)\) {$/gm

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
          content
            .replace(
              REPLACE_EXPORT_REGEX,
              'export const $1: FC<$2> = (props) => {'
            )
            .replace(
              "import React from 'react'",
              "import React, { FC } from 'react'"
            )
        )
      } catch (e) {
        console.warn(
          `Could not replace exports for ${file.path}. Error: ${e.message}`
        )
      }
    })
  )
}

const SPEC_FILE_REGEX = /spec\.tsx$/
const replaceTestingUtils = async (host: Tree) => {
  const files = new Set(
    host.listChanges().filter((file) => SPEC_FILE_REGEX.test(file.path))
  )

  const pathToTestUtils = path.resolve('./libs/ui/src/test-utils')
  return Promise.all(
    Array.from(files).map(async (file) => {
      const content = file.content.toString()
      // use '.' to get full path relative to current dir, then '..' to remove the file from the path
      const filePath = path.resolve('.', file.path, '..')
      const relativePath = path.relative(filePath, pathToTestUtils)

      host.write(
        file.path,
        content.replace('@testing-library/react', relativePath)
      )
    })
  )
}

const STORY_COMPONENT_REGEX = /(?<!spec)\.tsx$/
const generateStoryForComponent = async (host: Tree) => {
  const files = new Set(
    host.listChanges().filter((file) => STORY_COMPONENT_REGEX.test(file.path))
  )

  return Promise.all(
    Array.from(files).map((file) => {
      const componentPath = file.path.replace('libs/ui/src/', '')
      componentStoryGenerator(host, { project: 'ui', componentPath })
    })
  )
}

export default async (host: Tree, schema: any) => {
  await componentGenerator(host, {
    // Defaults to @nrwl/react component generator
    pascalCaseFiles: true,
    style: 'styled-components',
    project: 'ui',

    // Passing our options into this generator
    export: schema.export,
    name: schema.name,
    directory: schema.directory,
  })
  if (!schema.skipStories) {
    await generateStoryForComponent(host)
  }
  await replaceTestingUtils(host)
  await replaceExportFunction(host)
  await formatFiles(host)
  return () => {
    installPackagesTask(host)
  }
}
