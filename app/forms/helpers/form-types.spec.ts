import babel from '@babel/core'
import { traverse } from '@babel/core'
import fs from 'fs/promises'
import path from 'path'
test('FormTypes must contain references to all forms', async () => {
  let formIds: string[] = []

  const formFiles = (await fs.readdir(path.join(__dirname, '../')))
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => f.slice(0, -4))
    .sort()

  const AST = await parse(
    await fs.readFile(path.join(__dirname, './form-types.ts'), 'utf8')
  )
  traverse(AST, {
    TSInterfaceDeclaration(path) {
      const name = path.node.id.name
      if (name === 'FormTypes') {
        formIds = path.node.body.body
          .map((def) => (def as any).key.value)
          .sort()
        path.stop()
      }
    },
  })

  expect(formIds).toEqual(formFiles)
})

const parse = (src: string) =>
  babel.parseAsync(src, {
    plugins: ['@babel/plugin-syntax-typescript'],
    filename: __filename,
  })
