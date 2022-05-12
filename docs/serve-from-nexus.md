# Serving the Console from Nexus

## Wait! You probably don't need to build anything

Assets from commits on `main` are available at `dl.oxide.computer/releases/console/<sha>.tar.gz`. The latest `main` is probably what you want and can always be found at https://dl.oxide.computer/releases/console/main.tar.gz in addition to the path with the SHA.

If you want to use a version of the console that's already merged into `main`, just download the tarball and extract the files into the directory configured as `console.static_dir` in the Nexus config (the default in the example config `nexus/static`).

Following the rest of the instructions is only necessary if you want to build the assets yourself, for example if you're making a change to the console and want to test it locally against Nexus.

### Choosing a Console version to download

Most of the time you will want the latest commit on `main`. Look at [`OMICRON_VERSION`](/OMICRON_VERSION) to see what Omicron SHA that version of the console expects. Often it will work with a newer version of the API, but don't be surprised if it doesn't.

## Dependencies

- Node.js (tested on 14+, 16+ recommended)
- Yarn v1 — install with `npm install --global yarn`

## Note about pinned omicron version

The API client in the console is generated from a specific omicron commit (see [`OMICRON_VERSION`](/OMICRON_VERSION)), which means we can only be sure the API calls will work if you're running that version of Nexus. However, this shouldn't be a big issue for dev/testing because:

- We update the generated API client in console frequently
- Most API changes are additive, so if you're not running _too_ new a Nexus you'll probably be fine

In any case, if the console mostly works but requests to newer parts of the API seem to be failing, check the pinned omicron version. If you want to upgrade console's Nexus client, there are instructions in [docs/updated-pinned-api.md](/docs/update-pinned-api.md), but it's probably easier to talk to a console dev.

## Instructions

### Build assets

From Nexus's point of view, the Console is just some static assets it serves at a set of routes, so all you need to do to serve the console from Nexus is build the assets and put them in the right spot. To build the assets, run

```sh
yarn install && yarn build-for-nexus
```

Note that this script includes a `yarn install` to make sure dependencies are up to date.

The only difference between this build and the one for local dev is that the latter needs an `/api` prefix on API requests so the proxy server (nginx and Vite dev server respectively) knows which ones to pass on to Nexus. `yarn build-for-nexus` makes the prefix `""`, i.e., no prefix.

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
└── index.html
```

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
