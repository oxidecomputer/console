/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

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

        // Should only apply to top level components
        const parentStatement = componentFn.getStatementParent()
        if (!t.isProgram(parentStatement.parent)) {
          return
        }

        const declarator = componentFn.findParent((path) => t.isVariableDeclarator(path))
        if (declarator) {
          const name = declarator.node.id.name
          parentStatement.insertAfter(genDisplayName(path, name))
          return
        }

        const assignmentExpression = componentFn.findParent((path) =>
          t.isAssignmentExpression(path)
        )
        if (assignmentExpression) {
          const leftHandSide = assignmentExpression.node.left

          // Don't add display names to nested member expressions
          if (!t.isMemberExpression(leftHandSide)) {
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
