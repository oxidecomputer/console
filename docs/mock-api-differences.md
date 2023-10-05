# Understanding the mock API

## How it works

We use the same code that generates our API client to generate the shape of a
mock API. The core logic of the API (e.g., inserting a project into the
database) cannot be generated, so our strategy is to generate what we can from
the spec, leaving open a hole in the middle for a manual implementation. For
example, the generated handler for the create project endpoint automatically
uses a Zod validator to parse the request body (so we get accurate 400s on bad
requests), but it then passes the parsed result to a typed callback we implement
manually that checks if the name is taken and saves it to the mock DB. The type
on the callback ensures we are returning the right kind of thing from the
endpoint.

The manual implementation has an in-memory "database" (see
[`libs/api-mocks/msw/db.ts`](/libs/api-mocks/msw/db.ts)) which is just a JS
object with a property for each "table", which is just an array of models. We
use the generated types to make sure our mock seed data has the correct shape.

Because the model types and runtime validators are generated from the OpenAPI
spec, as long as the typechecker passes, you can be confident that what is being
returned from the mock API looks like what the real API would return, at least
as far as we are able to express that in the spec.

## What is different

There are way too many differences between our mock API and the real one to list
them all, but there are few that are particularly important to be aware of.

### DB is re-initialized on page refresh

While we do have in-memory persistence across client-side navigations, because
the mock server runs in the browser, it gets reset on pageload.

### Authentication and authorization

This is a big one. At time of writing, we only do one kind of authz check in the
mock API, and that's whether the user has fleet viewer permission. See
`requireFleetViewer` in
[`libs/api-mocks/msw/util.ts`](/libs/api-mocks/msw/util.ts). All
operator-related endpoints (i.e., ones that start with `/v1/system`) require
fleet viewer permissions (at least, but viewer is all we enforce). On other
resources (i.e., silos and projects) we do not currently do any authz checks in
the mock endpoints. We have found that failing to test logic around whether the
user has fleet viewer is a main source of bugs, whereas the logic around other
resources is not as big of a problem yet. Eventually we will probably have to
implement authz checks on silos and projects too, but we will wait because it's
better for the design to be informed by the actual bugs we are trying to avoid.
