# CSP headers in local dev and on Vercel

## Why

Production CSP headers are set server-side in Nexus, so why should we set the headers on Vercel and the Vite dev server too? We are not _that_ concerned about security in those environments. The main reason is so we can know as early as possible in the development process whether a given CSP directive breaks something the web console.

## What

The base headers are defined in `vercel.json` and imported into `vite.config.ts` to avoid repeating them.

The `content-security-policy` is based on the recommendation by the [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/index.html) (click the "Best Practices" tab). The directives:

- `default-src 'self'`: By default, restrict all resources to same-origin.
- `frame-src 'none'`: Disallow nested browsing contexts (`<frame>` and `<iframe>`).
- `object-src 'none'`: Disallow `<object>` and `<embed>`.
- `form-action 'none'`: Disallow submitting any forms with an `action` attribute (none of our forms are the traditional kind and instead post to the server in JS).
- `frame-ancestors 'none'`: Disallow embedding this site with things like `<iframe>`; used to prevent click-jacking attacks.

In development mode, additional `script-src` and `style-src` CSP directives are added which reference a randomly-generated nonce. [Vite injects this in the generated index.html](https://vitejs.dev/guide/features.html#content-security-policy-csp) so that the dev-mode scripts and stylesheets can load. We do this instead of allowing `'unsafe-inline'` because I'm not sure whether tests run against dev bits or not, and this helps get dev builds much closer to production.

Also set are `x-content-type-options: nosniff` and `x-frame-options: DENY`.
