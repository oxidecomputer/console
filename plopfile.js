// @ts-check

/**
 * @typedef { import("plop").NodePlopAPI } Plop
 */

const path = require('path')

const UI_ROOT_DIR = 'libs/ui/lib'

/** @type {(str: string) => string} */
const toTrainCase = (str) => {
  return str
    .split('')
    .map((char, i) => {
      if (i === 0) return char.toLowerCase()
      return /[A-Z]/.test(char) ? `-${char.toLowerCase()}` : char
    })
    .join('')
}

/** @type {(plop: Plop) => void} */
module.exports = (plop) => {
  plop.setGenerator('component', {
    description: 'Generate a React component and a story',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name?',
        validate: (input) => {
          if (/[a-z]/.test(input[0])) return 'Use SentenceCasing'
          if (input.includes(' ')) return "Whitespace isn't allowed"
          if (input.includes('-')) return '`-` unspported, prefer SentenceCasing'
          return true
        },
      },
      {
        type: 'input',
        name: 'subdir',
        message: `Directory within ${UI_ROOT_DIR}?`,
        default: ({ name }) => toTrainCase(name),
      },
    ],
    actions: (args) => {
      const dir = path.join(UI_ROOT_DIR, args.subdir)
      return [
        {
          type: 'add',
          path: '{{dir}}/{{name}}.tsx',
          templateFile: 'templates/component.hbs',
          skipIfExists: true,
          data: { dir },
        },
        {
          type: 'add',
          path: '{{dir}}/{{name}}.stories.tsx',
          templateFile: 'templates/stories-csf.hbs',
          skipIfExists: true,
          data: { dir },
        },
      ]
    },
  })
}
