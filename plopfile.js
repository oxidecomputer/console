const path = require('path')

const UI_ROOT_DIR = 'libs/ui/src/lib'
const PAGES_ROOT_DIR = 'apps/web-console/src/pages'

module.exports = (plop) => {
  plop.setGenerator('ui-component', {
    description: 'Generate a React component, a test file, and a story',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name?',
      },
      {
        type: 'input',
        name: 'subdir',
        message: `Directory within ${UI_ROOT_DIR}? (leave blank for root)`,
      },
      {
        type: 'confirm',
        name: 'mdx',
        message: 'Use MDX story format? (N for CSF)',
        default: false,
      },
    ],
    actions: (args) => {
      const dir = path.join(UI_ROOT_DIR, args.subdir)
      const testUtilsRelPath = path.relative(
        path.join('./', args.subdir, 'just-need', 'two-things-here'),
        './test-utils'
      )
      return [
        {
          type: 'add',
          path: '{{dir}}/{{dashCase name}}/{{name}}.tsx',
          templateFile: 'plop-templates/component.hbs',
          data: { dir },
        },
        {
          type: 'add',
          path: '{{dir}}/{{dashCase name}}/{{name}}.spec.tsx',
          templateFile: 'plop-templates/component-spec.hbs',
          data: { testUtilsRelPath, dir },
        },
        {
          type: 'add',
          path: '{{dir}}/{{dashCase name}}/{{name}}.stories.tsx',
          templateFile: 'plop-templates/component-stories.hbs',
          data: { dir },
          skip: () => args.mdx && 'CSF skipped, using MDX',
        },
        {
          type: 'add',
          path: '{{dir}}/{{dashCase name}}/__stories__/{{name}}.stories.mdx',
          templateFile: 'plop-templates/component-mdx.hbs',
          data: { dir },
          skip: () => !args.mdx && 'MDX skipped, using CSF',
        },
        {
          type: 'add',
          path: '{{dir}}/{{dashCase name}}/__stories__/{{name}}.stories.tsx',
          templateFile: 'plop-templates/component-stories.hbs',
          data: { dir },
          skip: () => !args.mdx && 'MDX skipped, using CSF',
        },
      ]
    },
  })

  plop.setGenerator('page', {
    description: 'Generate a Page component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Page name? (minus the "Page")',
      },
      {
        type: 'input',
        name: 'subdir',
        message: `Directory within ${PAGES_ROOT_DIR}? (leave blank for root)`,
      },
    ],
    actions: (args) => {
      const dir = path.join(PAGES_ROOT_DIR, args.subdir)
      const hooksRelPath = path.relative(
        path.join('./', args.subdir, 'Page.tsx'),
        './hooks'
      )
      return [
        {
          type: 'add',
          path: '{{dir}}/{{name}}Page.tsx',
          templateFile: 'plop-templates/page.hbs',
          data: { dir, hooksRelPath },
        },
      ]
    },
  })
}
