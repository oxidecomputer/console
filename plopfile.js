const path = require('path')

module.exports = function (plop) {
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
        name: 'dir',
        message: 'Subdirectory? (default is root, i.e., libs/ui/src/lib/)',
        filter: (subdir) => path.join('libs/ui/src/lib', subdir),
      },
    ],
    actions: [
      {
        type: 'add',
        path: '{{dir}}/{{dashCase name}}/{{name}}.tsx',
        templateFile: 'plop-templates/component.hbs',
      },
      {
        type: 'add',
        path: '{{dir}}/{{dashCase name}}/{{name}}.spec.tsx',
        templateFile: 'plop-templates/component-spec.hbs',
      },
      {
        type: 'add',
        path: '{{dir}}/{{dashCase name}}/{{name}}.stories.tsx',
        templateFile: 'plop-templates/component-stories.hbs',
      },
    ],
  })
}
