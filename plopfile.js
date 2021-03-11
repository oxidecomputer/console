const path = require('path')

const ROOT_DIR = 'libs/ui/src/lib'

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
        message: `Directory within ${ROOT_DIR}? (leave blank for root)`,
      },
    ],
    actions: ({ subdir }) => {
      const dir = path.join(ROOT_DIR, subdir)
      const testUtilsRelPath = path.relative(
        path.join('./', subdir, 'just-need', 'two-things-here'),
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
        },
      ]
    },
  })
}
