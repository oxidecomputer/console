const path = require('path')

const UI_ROOT_DIR = 'libs/ui/lib'

module.exports = (plop) => {
  plop.setGenerator('stories', {
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
    ],
    actions: (args) => {
      const dir = path.join(UI_ROOT_DIR, args.subdir)
      return [
        {
          type: 'add',
          path: '{{dir}}/{{name}}.stories.tsx',
          templateFile: 'plop/stories-csf.hbs',
          data: { dir },
        },
      ]
    },
  })
}
