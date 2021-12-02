# Serving the Console from Nexus

## Dependencies

- Node.js (tested on 14+, 16+ recommended)
- Yarn v1 — install with `npm install --global yarn`

## Note about pinned omicron version

The API client in the console is generated from a specific omicron commit (see [`OMICRON_VERSION`](/libs/api/__generated__/OMICRON_VERSION)), which means we can only be sure the API calls will work if you're running that version of Nexus. However, this shouldn't be a big issue for dev/testing because:

- We update the generated API client in console frequently
- Most API changes are additive, so if you're not running _too_ new a Nexus you'll probably be fine

In any case, if the console mostly works but requests to newer parts of the API seem to be failing, check the pinned omicron version. If you want to upgrade console's Nexus client, there are instructions in [docs/updated-pinned-api.md](/docs/update-pinned-api.md), but it's probably easier to talk to a console dev.

## Instructions

### Build assets

From Nexus's point of view, the Console is just some static assets it serves at a set of routes, so all you need to do to serve the console from Nexus is build the assets and put them in the right spot. To build the assets, run

```sh
yarn build-for-nexus
```

Note that this script includes a `yarn install` to make sure dependencies are up to date.

The only difference between this build and the one for GCP deploy or local dev is that the latter need an `/api` prefix on API requests so the proxy server (nginx and Vite dev server respectively) knows which ones to pass on to Nexus. `yarn build-for-nexus` makes the prefix `""`, i.e., no prefix.

### Set `console.static_dir` and copy files there (if necessary)

The build output lands in the `dist` directory. Now all you need to do is make `console.static_dir` in the Nexus config point to a directory containing these files.

If you're using the example Nexus config, `static_dir` is set there to `nexus/static` (treated as relative to CWD), so that's a reasonable default location for the files. Another option is to point Nexus directly at `dist` so you don't even have to copy them. Nexus accepts both absolute and relative paths.

Whatever the directory is, the files need to be at top level, just like they are in `dist`:

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

### Navigate to console in browser

Once nexus is running, you can open the Console in your browser by going to `<nexus_address>/login`. By default (based on the example config in omicron) this will be `http://localhost:12220/login`. Note that the root route will 404 (for now).

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
