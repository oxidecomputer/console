// @ts-check

module.exports = {

  commands: [

    ['icons', {
      fileId: 'D5ukCJbedrlGkUIh0E6QtX',
      onlyFromPages: ['Icons'],
      transformers: [],
      outputters: [
        require('@figma-export/output-components-as-svgr')({
          output: './libs/ui/lib/icons'
        })
      ]
    }]

  ]

}
