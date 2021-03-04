import * as docgen from 'react-docgen-typescript'
import * as fs from 'fs'

const options = {
  shouldExtractLiteralValuesFromEnum: true,
}

const gen = docgen.withCompilerOptions(
  {
    paths: {
      '@oxide/ui': ['libs/ui/src/index.ts'],
      '@oxide/theme': ['libs/theme/src/index.ts'],
      '@oxide/backend-types': ['libs/backend-types/src/index.ts'],
    },
  },
  options
)

// const doc = docgen.parse('./libs/ui/src/lib/button/Button.tsx', options)
// const doc = gen.parse(
//   './libs/ui/src/lib/layout/sidebar-navigation/project-list/ProjectList.tsx'
// )
const doc = gen.parse('./libs/ui/src/lib/avatar/Avatar.tsx')

fs.writeFileSync('test.json', JSON.stringify(doc, null, 2))
