import {
  Tree,
  formatFiles,
  installPackagesTask,
  joinPathFragments,
  names,
  getProjects,
  generateFiles,
  applyChangesToString,
} from '@nrwl/devkit'
import { componentStoryGenerator } from '@nrwl/react'
import { addImport } from '@nrwl/react/src/utils/ast-utils'
import * as path from 'path'
import * as ts from 'typescript'
import type { Schema } from './schema'

interface NormalizedSchema extends Schema {
  projectSourceRoot: string
  fileName: string
  className: string
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

const createComponentFiles = (host: Tree, options: NormalizedSchema) => {
  const componentDir = joinPathFragments(
    options.projectSourceRoot,
    options.directory
  )
  const pathToTestUtils = path.resolve('./libs/ui/src/test-utils')
  const testingUtilsPath = path.relative(componentDir, pathToTestUtils)

  generateFiles(host, joinPathFragments(__dirname, './files'), componentDir, {
    ...options,
    tmpl: '',
    testingUtilsPath,
  })
}

const assertValidOptions = (options: Schema) => {
  const slashes = ['/', '\\']
  slashes.forEach((s) => {
    if (options.name.indexOf(s) !== -1) {
      const [name, ...rest] = options.name.split(s).reverse()
      let suggestion = rest.map((x) => x.toLowerCase()).join(s)
      if (options.directory) {
        suggestion = `${options.directory}${s}${suggestion}`
      }
      throw new Error(
        `Found "${s}" in the component name. Did you mean to use the --directory option (e.g. \`nx g c ${name} --directory ${suggestion}\`)?`
      )
    }
  })
}

const getDirectory = (host: Tree, options: Schema) => {
  const { fileName } = names(options.name)

  let baseDir: string
  if (options.directory) {
    baseDir = options.directory
  } else {
    baseDir = 'lib'
  }

  return joinPathFragments(baseDir, fileName)
}

const normalizeOptions = (host: Tree, options: Schema): NormalizedSchema => {
  assertValidOptions(options)

  const { className, fileName } = names(options.name)
  const componentFileName = className
  const { sourceRoot: projectSourceRoot, projectType } = getProjects(host).get(
    'ui'
  )

  const directory = getDirectory(host, options)

  return {
    ...options,
    directory,
    className,
    fileName: componentFileName,
    projectSourceRoot,
  }
}

const addExportsToBarrel = (host: Tree, options: NormalizedSchema) => {
  if (options.export) {
    const indexFilePath = joinPathFragments(
      options.projectSourceRoot,
      'index.ts'
    )
    const buffer = host.read(indexFilePath)
    if (!!buffer) {
      const indexSource = buffer.toString('utf-8')
      const indexSourceFile = ts.createSourceFile(
        indexFilePath,
        indexSource,
        ts.ScriptTarget.Latest,
        true
      )
      const changes = applyChangesToString(
        indexSource,
        addImport(
          indexSourceFile,
          `export * from './${options.directory}/${options.fileName}'`
        )
      )
      host.write(indexFilePath, changes)
    }
  }
}

export default async (host: Tree, schema: Schema) => {
  const options = normalizeOptions(host, schema)

  createComponentFiles(host, options)

  addExportsToBarrel(host, options)
  // await componentGenerator(host, {
  //   // Defaults to @nrwl/react component generator
  //   pascalCaseFiles: true,
  //   style: 'styled-components',
  //   project: 'ui',

  //   // Passing our options into this generator
  //   export: schema.export,
  //   name: schema.name,
  //   directory: schema.directory,
  // })
  // if (!schema.skipStories) {
  //   await generateStoryForComponent(host)
  // }
  // await replaceTestingUtils(host)
  // await replaceExportFunction(host)
  await formatFiles(host)
  return () => {
    installPackagesTask(host)
  }
}
