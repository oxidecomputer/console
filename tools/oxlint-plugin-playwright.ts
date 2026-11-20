/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// Local Playwright lint rules. expect-expect replaces eslint-plugin-playwright,
// which has eslint as a peer dep and so installed all of eslint. oxlint's
// built-in jest/expect-expect and vitest/expect-expect don't recognize
// Playwright's `test`, so they can't stand in for it.
//
// TODO: rules to add once their existing violations are fixed. They enforce
// conventions from the "Testing code" section of CLAUDE.md. Counts are
// approximate uses in test/e2e when this was written.
// - no sleep() or page.waitForTimeout() (6): fix the timing root cause instead
// - no getByTestId (8): use accessible locators like getByRole
// - no expectVisible/expectNotVisible (78): use expect().toBeVisible()/toBeHidden()
// - no legacy string selectors like page.click('role=button[name="..."]') (187):
//   use getByRole and friends

import type { RuleTester } from 'oxlint/plugins-dev'

// oxlint only exposes its plugin types through RuleTester
type Rule = Parameters<RuleTester['run']>[1]
type Visitor = ReturnType<NonNullable<Rule['create']>>
type CallExpression = Parameters<NonNullable<Visitor['CallExpression']>>[0]

/**
 * The dotted path of a callee made only of names, like `test.describe.only`.
 * Undefined for anything else, like `this.page.route` or `expect(x).toBe`.
 */
function dottedName(node: CallExpression['callee']): string | undefined {
  if (node.type === 'Identifier') return node.name
  if (node.type !== 'MemberExpression' || node.computed) return undefined
  if (node.property.type !== 'Identifier') return undefined
  const object = dottedName(node.object)
  return object && `${object}.${node.property.name}`
}

// test.step(), test.slow(), etc. take callbacks too, but they aren't tests
const TESTS = new Set([
  'test',
  'test.only',
  'test.skip',
  'test.fixme',
  'test.fail',
  'test.fail.only',
])
// covers variants like test.describe.serial
const isDescribe = (name: string) =>
  name === 'test.describe' || name.startsWith('test.describe.')

const expectExpect: Rule = {
  meta: { type: 'problem', messages: { noAssertions: 'Test has no assertions' } },
  create(context) {
    // A scope is the file or a test.describe() callback. Its afterEach hooks
    // apply to every test in it, including nested describes, and can come
    // after the tests, so whether an unasserted test is covered is only known
    // once the scope has been fully visited. (beforeEach runs before the test
    // body and often just waits for the page to load, so it doesn't count.)
    type Scope = {
      node?: CallExpression
      afterEachAsserts: boolean
      unasserted: CallExpression[]
    }
    const file: Scope = { afterEachAsserts: false, unasserted: [] }
    const describes: Scope[] = []
    const innermost = () => describes.at(-1) ?? file
    // the test or afterEach callback we're in
    let body: { node: CallExpression; isAfterEach: boolean; asserted: boolean } | undefined

    return {
      CallExpression(node) {
        const name = dottedName(node.callee)
        if (!name) return
        if (body) {
          // any call starting with expect counts as an assertion, which covers
          // expect(), expect.poll(), and helpers like expectRowVisible()
          if (name.startsWith('expect')) body.asserted = true
          return
        }
        const fn = node.arguments.at(-1)
        const hasCallback =
          fn?.type === 'ArrowFunctionExpression' || fn?.type === 'FunctionExpression'
        if (!hasCallback) return
        if (isDescribe(name)) {
          describes.push({ node, afterEachAsserts: false, unasserted: [] })
        } else if (name === 'test.afterEach') {
          body = { node, isAfterEach: true, asserted: false }
        } else if (TESTS.has(name) && node.arguments.length >= 2) {
          // >= 2 excludes 1-arg condition modifiers like test.skip(({ browserName }) => ...)
          body = { node, isAfterEach: false, asserted: false }
        }
      },
      'CallExpression:exit'(node) {
        const scope = innermost()
        if (node === body?.node) {
          if (body.isAfterEach) scope.afterEachAsserts ||= body.asserted
          else if (!body.asserted) scope.unasserted.push(node)
          body = undefined
        } else if (node === scope.node) {
          describes.pop()
          // afterEach in an enclosing scope may still cover these
          if (!scope.afterEachAsserts) innermost().unasserted.push(...scope.unasserted)
        }
      },
      'Program:exit'() {
        if (file.afterEachAsserts) return
        for (const node of file.unasserted) {
          context.report({ node: node.callee, messageId: 'noAssertions' })
        }
      },
    }
  },
}

const noFocusedTest: Rule = {
  meta: { type: 'problem', messages: { focused: 'Remove .only so the whole suite runs' } },
  create: (context) => ({
    CallExpression(node) {
      const name = dottedName(node.callee)
      if (name?.startsWith('test.') && name.endsWith('.only')) {
        context.report({ node: node.callee, messageId: 'focused' })
      }
    },
  }),
}

const noPageRoute: Rule = {
  meta: {
    type: 'problem',
    messages: {
      pageRoute:
        "Don't intercept API calls with route(). Make the mock API handler return the error for a sentinel input instead.",
    },
  },
  create: (context) => ({
    CallExpression({ callee }) {
      if (
        callee.type === 'MemberExpression' &&
        !callee.computed &&
        callee.property.type === 'Identifier' &&
        callee.property.name === 'route'
      ) {
        context.report({ node: callee, messageId: 'pageRoute' })
      }
    },
  }),
}

export default {
  meta: { name: 'playwright' },
  rules: {
    'expect-expect': expectExpect,
    'no-focused-test': noFocusedTest,
    'no-page-route': noPageRoute,
  },
}
