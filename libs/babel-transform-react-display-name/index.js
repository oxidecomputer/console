/** @ts-check */
const { relative } = require('path')

const cwd = process.cwd()

/**
 * @param {string} path
 * @returns string
 */
const filePath = (path) => {
  return relative(cwd, path.hub.file.opts.filename)
}

/**
 * @param {{ types: import('@babel/types') }}
 * @returns {import('@babel/core').PluginObj}
 */
module.exports = function ({ types: t }) {
  const genDisplayName = (path, name, meta) =>
    t.assignmentExpression(
      '=',
      t.memberExpression(t.identifier(name), t.identifier('displayName')),
      t.stringLiteral(`${name}${meta ? ` |${meta}|` : ''} - ${filePath(path)}`)
    )

  const printMemberExpression = (memberExpression) => {
    if (t.isIdentifier(memberExpression)) return memberExpression.name
    return `${printMemberExpression(memberExpression.object)}.${
      memberExpression.property.name
    }`
  }

  return {
    name: 'react-display-name',
    visitor: {
      JSXElement(path) {
        // Stop deeper traversal
        path.skip()

        const componentFn = path.getFunctionParent()

        // Bail if JSX isn't in return statement or implicit arrow fn
        if (
          !t.isArrowFunctionExpression(componentFn) &&
          !path.findParent((path) => t.isReturnStatement(path))
        ) {
          return
        }

        if (t.isFunctionDeclaration(componentFn) && componentFn.node.id) {
          componentFn.insertAfter(genDisplayName(path, componentFn.node.id.name))
          return
        }

        const isExpressionFn =
          t.isFunctionExpression(componentFn) || t.isArrowFunctionExpression(componentFn)

        if (!isExpressionFn) return

        const declarator = componentFn.findParent((path) => t.isVariableDeclarator(path))
        if (declarator) {
          const parentStatement = componentFn.getStatementParent()
          const name = declarator.node.id.name
          parentStatement.insertAfter(genDisplayName(path, name))
          return
        }

        const assignmentExpression = componentFn.findParent((path) =>
          t.isAssignmentExpression(path)
        )
        if (assignmentExpression) {
          const parentStatement = componentFn.getStatementParent()
          const leftHandSide = assignmentExpression.node.left

          // Only want to do this step for top level components
          if (!t.isProgram(parentStatement.parent) || !t.isMemberExpression(leftHandSide)) {
            return
          }

          parentStatement.insertAfter(
            t.assignmentExpression(
              '=',
              t.memberExpression(leftHandSide, t.identifier('displayName')),
              t.stringLiteral(`${printMemberExpression(leftHandSide)} - ${filePath(path)}`)
            )
          )
          return
        }
      },

      TaggedTemplateExpression(path) {
        // Don't search any deeper
        path.skip()

        if (t.isMemberExpression(path.node.tag)) {
          const memberString = printMemberExpression(path.node.tag)
          if (memberString.startsWith('classed.')) {
            const declarator = path.findParent((path) => t.isVariableDeclarator(path))
            if (!declarator) return
            const parentStatement = path.getStatementParent()
            parentStatement.insertAfter(
              genDisplayName(path, declarator.node.id.name, memberString)
            )
          }
        }
      },
    },
  }
}
