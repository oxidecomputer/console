# Tailwind and twin.macro crash course

## Official guides

- [`tw` prop guide](https://github.com/ben-rogerson/twin.macro/blob/master/docs/prop-styling-guide.md)
- [Styled components guide](https://github.com/ben-rogerson/twin.macro/blob/master/docs/styled-component-guide.md)

## How it works

A given file needs to have a `twin.macro` import for the `tw` attr to work (i.e., in order for the babel macro to kick in). When you make the following change:

```diff
- import { css, styled } from 'twin.macro'
+ import { styled, css } from 'twin.macro'
```

the resulting `styled` and `css` modules are identical (Twin gets them from `styled-components`), but the presence of `twin.macro` in the import is necessary for the `tw` attr to get turned into Tailwind styles. Otherwise the `tw` passes through and lands in the DOM.

## twin.macro basics

Most of this is from the [readme](https://github.com/ben-rogerson/twin.macro) but this is a little more comprehensive about multiple ways of doing the same thing.

```js
// inline tw
<span tw="text-sm">Some text</span>

// component with only TW classes
const List = tw.ul`flex flex-col text-gray-400 uppercase space-y-1 mt-1`

// mixing Tailwind classes and CSS
const ListItemLink = styled(BaseLink)`
  ${tw`flex space-x-2`}
  background-image: url("...");
`

// mixins
const titleText = tw`text-2xl text-green-500 uppercase`

// using mixins
<span css={titleText}>Some text</span>

const ListItemLink = styled(BaseLink)`
  ${linkText}
  background-image: url("...");
`

// multiple mixins
<span css={[titleText, otherStyles]}>Some text</span>

// conditional styling inline
<span css={[titleText, active && tw`border-purple-500`]}>Some text</span>

// conditional styling with props
const StyledInput = styled.input`
  color: black;
  ${({ hasBorder }) => hasBorder && tw`border-purple-500`}
`

// conditional styling with props (alt.)
const StyledInput = styled.input(({ hasBorder }) => [
  `color: black;`,
  hasBorder && tw`border-purple-500`,
])

// sometimes you need to use a color from the theme directly. use the theme import
import { theme, css } from 'twin.macro'

const CustomStyles = createGlobalStyle`
  .dark {
    --bg-primary: ${theme`colors.black`};
    --bg-secondary: ${theme`colors.grey.5`};
  }
`
```

Only string literals can go inside the `tw` prop and `tw` tagged template. Use the `css` prop if you want to be fancy.

```js
// good
const color = active ? tw`text-green-500` : tw`text-white`

<span css={active ? tw`text-green-500` : tw`text-white`}>Some text</span>

// ERROR
const color = tw`text-${active ? 'green-500' : 'white'}`

<span tw={tw`text-sm`}>Some text</span>

<span tw={active ? tw`text-green-500` : tw`text-white`}>Some text</span>
```

## Tailwind basics

There's very little to it and the [docs](https://tailwindcss.com/docs) are excellent. We are already using the spacing and text size increments and the color names.

| CSS concept        | Tailwind version                              |
| ------------------ | --------------------------------------------- |
| `margin`           | `m` + `(t/r/b/l/x/y)` + number                |
| `padding`          | `p` + `(t/r/b/l/x/y)` + number                |
| `height/width`     | `h/w` + number, fraction, `full`, or `screen` |
| `font-size`        | `text-sm`, `text-base`, `text-lg`             |
| `color`            | `text-green-500`                              |
| `background-color` | `bg-green-500`                                |
| `display`          | `block`, `inline`, `flex`, `inline-flex`      |
| `border`           | `border` + `border-green-800`                 |
| `:hover`           | `hover:bg-green-500`                          |
