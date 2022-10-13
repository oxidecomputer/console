// @ts-check

const { pascalCase } = require('@figma-export/utils')

module.exports = {
  commands: [
    [
      'components',
      {
        fileId: 'iMVpYGoNGpwMEL9gd0oeYF',
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
            getDirname: () => '',
            getComponentName: ({ componentName }) =>
              pascalCase(
                componentName
                  .split('/')
                  .map((n) => `${n[0].toUpperCase()}${n.slice(1)}`)
                  .reverse()
                  .join('') + 'Icon'
              ),
            getSvgrConfig: () => {
              return {
                jsxRuntime: 'automatic',
                typescript: true,
                titleProp: true,
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
