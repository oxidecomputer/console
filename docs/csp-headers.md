# CSP headers in development and on Vercel

Note: production headers are set server-side in Nexus. The headers set in this repo are meant to match what is set there (and should be kept in sync as far as possible) but real header changes must be made in the Omicron repo.

The base headers are defined in `vercel.json` and then imported into `vite.config.ts` to avoid repeating them.

The `content-security-policy` is based on the recommendation by the [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/index.html) (click the "Best Practices" tab). The directives:

- `default-src 'self'`: By default, restrict all resources to same-origin.
- `style-src 'unsafe-inline' 'self'`: Restrict CSS to same-origin and inline use. `style=` attributes on React elements seem to count as inline.
- `frame-src 'none'`: Disallow nested browsing contexts (`<frame>` and `<iframe>`).
- `object-src 'none'`: Disallow `<object>` and `<embed>`.
- `form-action 'none'`: Disallow submitting any forms with an `action` attribute (none of our forms are the traditional kind and instead post to the server in JS).
- `frame-ancestors 'none'`: Disallow embedding this site with things like `<iframe>`; used to prevent click-jacking attacks.

In development mode, an additional `script-src` CSP directive is added which references a randomly-generated nonce. [Vite injects this in the generated index.html](https://vitejs.dev/guide/features.html#content-security-policy-csp) so that the dev-mode scripts can load. We do this instead of allowing `'unsafe-inline'` because I'm not sure whether tests run against dev bits or not, and this helps get dev builds much closer to production.

Also set are `x-content-type-options: nosniff` and `x-frame-options: DENY`.
