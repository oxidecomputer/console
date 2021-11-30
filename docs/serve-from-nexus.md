# Serving the Console from Nexus

## Build assets

From Nexus's point of view, the Console is just some static assets it serves at a set of routes, so all you need to do to serve the console from Nexus is build the assets and put them in the right spot. To build the assets, run

```sh
yarn install  # only needs to be done once
yarn build-for-nexus
```

Note: The only difference between this and the GCP deploy or local dev is that the latter put an `/api` prefix on API requests so the proxy server (nginx and Vite dev server respectively) can know which ones to pass on to Nexus. `yarn build-for-nexus` makes the prefix `""`, i.e., no prefix.

## Set `console.static_dir` and copy files (or not)

The build output lands in the `dist` directory. Now all you need to do is make `console.static_dir` in the Nexus config point to a directory containing these files. You could point Nexus directly at `dist` or you could copy the files to a directory closer to Nexus and point Nexus to that. Nexus accepts an absolute path or a path relative to the current working directory.

The files need to be at top-level in whatever directory Nexus is pointing to, just like they are in `dist`:

```
<static_dir>
├── assets
│   ├── Inter-Black.05f95cac.ttf
│   ├── ...
│   └── vendor.b63b8457.js.map
├── docs
│   └── index.html
└── index.html
```

(`docs/` doesn't matter for now but it's easier to leave it in than take it out.)

## Example

If I have `console` and `omicron` sitting next to each other in the same directory and this in my Nexus config:

```toml
[console]
static_dir = "nexus/static"
```

I would run `yarn build-for-nexus` in `console` and then use the following command to copy the files over:

```bash
cp -R dist/ ../omicron/nexus/static
```

The `/` after `dist` is there on purpose — if the target directory already exists, if I leave off the `/` it will copy `dist` into the target with its contents inside rather than the copying only the contents.
