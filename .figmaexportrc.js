// @ts-check

const { pascalCase } = require('@figma-export/utils')

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
            getDirname: ({ dirname }) => dirname,
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
