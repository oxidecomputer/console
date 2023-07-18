/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *  
 * Copyright Oxide Computer Company
 */

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
