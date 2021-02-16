# Icon

Icons are rendered as inline SVGS using the [SVGR loader](https://react-svgr.com/docs/getting-started/). Rendering them inline means their `fill` color can be changed via CSS.

## Adding an Icon

On the Oxide Design System Figma [Icons page](https://www.figma.com/file/EUf6YnFJx0AKE8GGYDAoRO/Oxide-Design-System?node-id=11%3A490), export the icon you want as an SVG. Alternatively, ask one of the designers for the file!

Next, run the icon through [SVGOMG](https://jakearchibald.github.io/svgomg/) which will compress and clean up the SVG. The default settings are good enough. Ideally the resulting SVG will only have one or two `<path>` elements at the most. Remove any `fill=""` attributes hard-coded in the SVG file.

Add the file to `./libs/ui/src/assets` and follow the naming convention and accessibility rules outlined below.

## Accessibility

Each `.svg` icon should follow [accessibility best practices](https://www.deque.com/blog/creating-accessible-svgs/). In this case, it means making sure of the following:

- the parent `<svg>` tag has `role="img"` to ensure it gets treated as an image
- the parent `<svg>` tag has an aria labelledby property `aria-labelledby="icon-[ICON_NAME_HERE]"`
- and the first child should be a `<title>` tag with the matching id `id="icon-[ICON_NAME_HERE]"`

The `name` prop matches the `[ICON_NAME_HERE]` label so that you know what screenreaders will be reading. Since each icon is read by a screenreader, treat them as additional text when composing them with other elements.

For example, the following composition:

```tsx
<Icon name="gear" /> Settings
```

will output something like "Gear (image) Settings" or "Gear (graphic) Settings" to the user depending on their software and browser combination.

## Usage

The `<Icon />` component takes two props.

- `name` can be any of the names listed in the table below
- `color` can be any of the available theme colors (e.g. `"green500"`) or any valid CSS color (e.g. `"#ff0000`)

```tsx
<Icon name="dashboard" color="green500" />
```
