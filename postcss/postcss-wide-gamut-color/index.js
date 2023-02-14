/**
 * @type {import('postcss').PluginCreator}
 */
var valueParser = require('postcss-value-parser')

module.exports = (opts = {}) => {
  var properties = opts.properties || [
    'background-color',
    'background',
    'color',
    'border',
    'border-color',
    'outline',
    'outline-color',
  ]

  let opacity = 1

  return {
    postcssPlugin: 'postcss-wide-gamut-color',

    Rule(rule) {
      const regex = /(?<=opacity:)(.*\n?)(?=;)/
      const match = rule.toString().match(regex)

      if (match) {
        opacity = match[0].trim()
      }
    },

    Declaration(decl) {
      if (
        !decl.value ||
        decl.value.indexOf('rgb') === -1 ||
        properties.indexOf(decl.prop) === -1
      ) {
        return
      }

      // if previous prop equals current prop
      // no need fallback
      if (decl.prev() && decl.prev().prop === decl.prop) {
        return
      }

      let rgb = []
      let opacityValue
      valueParser(decl.value)
        .walk(function (node) {
          var nodes = node.nodes
          if (node.type === 'function' && node.value === 'rgb') {
            try {
              rgb = [
                (parseInt(nodes[0].value, 10) / 255).toFixed(4),
                (parseInt(nodes[2].value, 10) / 255).toFixed(4),
                (parseInt(nodes[4].value, 10) / 255).toFixed(4),
              ]

              if (nodes[6]) {
                opacityValue = ` / ${opacity}`
              }
            } catch (e) {
              return false
            }
            return false
          }
        })
        .toString()

      let value = `color(display-p3 ${rgb[0]} ${rgb[1]} ${rgb[2]}${
        opacityValue ? opacityValue : ''
      })`

      if (value !== decl.value) {
        decl.parent.append({
          prop: decl.prop,
          value: value,
        })
      }
    },
  }
}

module.exports.postcss = true
