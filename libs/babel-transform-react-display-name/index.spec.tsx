import babel from '@babel/core'

// @ts-expect-error We don't really need to directly deal with this interface anyway, so it's fine
import plugin from './index'

describe('functions returning JSX', () => {
  it("skips functions that don't return jsx", () => {
    const result = transform`
    export function FooBar() {
      const element = <h1/>
      return null
    }
  `
    expect(result).not.toContain('FooBar.displayName')
  })

  it('adds a display name to a top level exported functional component', () => {
    const results = transform`
    export function MyComponent() {
      return <h1/>
    }
  `

    expect(results).toContain('MyComponent.displayName = ')
    expect(results).toMatchInlineSnapshot(`
      "\\"use strict\\";

      Object.defineProperty(exports, \\"__esModule\\", {
        value: true
      });
      exports.MyComponent = MyComponent;
      function MyComponent() {
        return /*#__PURE__*/React.createElement(\\"h1\\", null);
      }
      MyComponent.displayName = \\"MyComponent - libs/babel-transform-react-display-name/index.spec.tsx\\";"
    `)
  })

  it('adds a display name to a top level function expression component', () => {
    const results = transform`
    export const MyComponent = function() {
      return <h1/>
    }
  `
    expect(results).toContain('MyComponent.displayName =')
  })

  it('uses the variable name of function expression component', () => {
    const results = transform`
    export const MyComponent = function FooBar() {
      return <h1/>
    }
  `
    expect(results).toContain('MyComponent.displayName =')
  })

  it('adds a display name to a top level arrow functional component', () => {
    const results = transform`
    export const MyComponent = () => <h1/>
  `
    expect(results).toContain('MyComponent.displayName =')
    expect(results).toMatchInlineSnapshot(`
      "\\"use strict\\";

      Object.defineProperty(exports, \\"__esModule\\", {
        value: true
      });
      exports.MyComponent = void 0;
      const MyComponent = () => /*#__PURE__*/React.createElement(\\"h1\\", null);
      exports.MyComponent = MyComponent;
      MyComponent.displayName = \\"MyComponent - libs/babel-transform-react-display-name/index.spec.tsx\\""
    `)
  })

  it('adds a display name to associated components', () => {
    const result = transform`
    Foo.Bar = () => <h1/>
    Foo.Bar.Bow = () => <h1/>
    Foo.Baz = function() { return <h1/> }
    Foo.Booz = function Nope() { return <h1/> }
  `
    expect(result).toMatchInlineSnapshot(`
      "\\"use strict\\";

      Foo.Bar = () => /*#__PURE__*/React.createElement(\\"h1\\", null);
      Foo.Bar.displayName = \\"Foo.Bar - libs/babel-transform-react-display-name/index.spec.tsx\\"
      Foo.Bar.Bow = () => /*#__PURE__*/React.createElement(\\"h1\\", null);
      Foo.Bar.Bow.displayName = \\"Foo.Bar.Bow - libs/babel-transform-react-display-name/index.spec.tsx\\"
      Foo.Baz = function () {
        return /*#__PURE__*/React.createElement(\\"h1\\", null);
      };
      Foo.Baz.displayName = \\"Foo.Baz - libs/babel-transform-react-display-name/index.spec.tsx\\"
      Foo.Booz = function Nope() {
        return /*#__PURE__*/React.createElement(\\"h1\\", null);
      };
      Foo.Booz.displayName = \\"Foo.Booz - libs/babel-transform-react-display-name/index.spec.tsx\\""
    `)
    expect(result).toContain('Foo.Bar.displayName = ')
    expect(result).toContain('Foo.Bar.Bow.displayName = ')
    expect(result).toContain('Foo.Baz.displayName = ')
    expect(result).toContain('Foo.Booz.displayName = ')
  })

  it('ignores arrow functions passed as arguments', () => {
    const result = transform`
    callback(() => <h1/>)
  `
    expect(result).toMatchInlineSnapshot(`
      "\\"use strict\\";
      
      callback(() => /*#__PURE__*/React.createElement(\\"h1\\", null));"
    `)
  })

  it('should add displayName to forwardRef components', () => {
    const result = transform`
    export const Button = forwardRef(
      ({children, ...props}, ref) => {
        return (
          <button
            ref={ref}
            type="button"
            {...props}
          >
            {children}
          </button>
        )
      }
    )
  `

    expect(result).toMatchInlineSnapshot(`
      "\\"use strict\\";

      var _interopRequireDefault = require(\\"@babel/runtime/helpers/interopRequireDefault\\");
      Object.defineProperty(exports, \\"__esModule\\", {
        value: true
      });
      exports.Button = void 0;
      var _extends2 = _interopRequireDefault(require(\\"@babel/runtime/helpers/extends\\"));
      const Button = forwardRef((_ref, ref) => {
        let {
          children,
          ...props
        } = _ref;
        return /*#__PURE__*/React.createElement(\\"button\\", (0, _extends2.default)({
          ref: ref,
          type: \\"button\\"
        }, props), children);
      });
      exports.Button = Button;
      Button.displayName = \\"Button - libs/babel-transform-react-display-name/index.spec.tsx\\""
    `)
    expect(result).toContain('Button.displayName = ')
  })
})

describe('classed template tag literals', () => {
  it('should add a displayName to top level classed template tags', () => {
    const result = transform`
      const MyDiv = classed.div\`mb-4\`;
    `

    expect(result).toMatchInlineSnapshot(`
      "\\"use strict\\";
      
      const MyDiv = classed.div\`mb-4\`;
      MyDiv.displayName = \\"MyDiv |classed.div| - libs/babel-transform-react-display-name/index.spec.tsx\\""
    `)
    expect(result).toContain('MyDiv.displayName = ')
  })
})

describe('cases that should not be transformed', () => {
  it('should not transform a non-top level JSX function', () => {
    const result = transform`
      export function f() {
        const nestedComponent = () => <div/> 
      }
    `

    expect(result).toMatchInlineSnapshot(`
      "\\"use strict\\";

      Object.defineProperty(exports, \\"__esModule\\", {
        value: true
      });
      exports.f = f;
      function f() {
        const nestedComponent = () => /*#__PURE__*/React.createElement(\\"div\\", null);
      }"
    `)
  })
})

/**
 * Helper to streamline babel transforms
 */
function transform(strings: TemplateStringsArray) {
  return babel.transformSync(strings.join(''), {
    plugins: [plugin],
    filename: __filename,
  })?.code
}
