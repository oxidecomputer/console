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
import { addImport } from '@nrwl/react/src/utils/ast-utils'
import * as path from 'path'
import * as ts from 'typescript'
import type { Schema } from './schema'

interface NormalizedSchema extends Schema {
  projectSourceRoot: string
  fileName: string
  className: string
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

  for (const c of host.listChanges()) {
    let deleteFile = false

    if (options.skipStories && /stories/.test(c.path)) {
      deleteFile = true
    }

    if (
      !options.skipStories &&
      options.storyType === 'csf' &&
      /\/__stories__\//.test(c.path)
    ) {
      deleteFile = true
    }

    if (
      !options.skipStories &&
      options.storyType === 'mdx' &&
      /(?<!__stories__)\/\w*\.stories\.tsx/.test(c.path)
    ) {
      deleteFile = true
    }

    if (deleteFile) {
      host.delete(c.path)
    }
  }
}

const assertValidOptions = (options: Schema) => {
  if (options.storyType !== 'mdx' && options.storyType !== 'csf') {
    throw new Error(`Invalid story type. Valid options are \`mdx\` or \`csf\``)
  }

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

  const { className } = names(options.name)
  const componentFileName = className
  const { sourceRoot: projectSourceRoot } = getProjects(host).get('ui')

  const directory = getDirectory(host, options)

  return {
    ...options,
    storyType: options.storyType || 'csf',
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

  await formatFiles(host)
  return () => {
    installPackagesTask(host)
  }
}
