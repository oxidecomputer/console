// @ts-check

const { pascalCase, camelCase } = require('@figma-export/utils')

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

module.exports = {
  commands: [
    [
      'components',
      {
        fileId: 'D5ukCJbedrlGkUIh0E6QtX',
        onlyFromPages: ['Icons'],
        transformers: [
          require('@figma-export/transform-svg-with-svgo')({
            plugins: [],
          }),
        ],
        outputters: [
          require('@figma-export/output-components-as-svgr')({
            output: './libs/ui/lib/icons',
            getFileExtension: () => '.tsx',
            getDirname: ({ dirname }) => toTrainCase(camelCase(dirname)),
            getComponentName: ({ basename }) => `${pascalCase(basename)}Icon`,
            getSvgrConfig: () => {
              return {
                typescript: true,
                titleProp: true,
                prettier: true,
                svgProps: {
                  role: 'img',
                },
              }
            },
          }),
        ],
      },
    ],
  ],
}
