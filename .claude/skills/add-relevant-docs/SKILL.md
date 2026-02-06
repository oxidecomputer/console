---
name: add-relevant-docs
description: Audit and improve help text, microcopy, and "Relevant docs" links across console networking and other UI pages. Use when adding or updating documentation links in side modals, page headers (DocsPopover), or inline help text.
---

# Add and Improve Relevant Docs

Use this skill when auditing or adding documentation links and help text to console UI pages and forms.

## Overview

The console links to Oxide documentation in two ways:

1. **DocsPopover** — info button in page headers that opens a popover with a summary and doc links. Used on list/detail pages.
2. **ModalLinks / ModalLink** — "Relevant docs" section at the bottom of side modal forms. Used in create/edit forms.

## Workflow

### 1. Identify the docs content

Fetch the docs site LLM summary to understand available pages and sections:

```
Primary: https://docs.oxide.computer/llms.txt
```

If a specific release version is relevant (e.g., v18), also check the preview site first:

```
Preview: https://docs-git-v<VERSION>-oxidecomputer.vercel.app/llms.txt
```

The preview site has the same URL paths — only the hostname differs. Always use `docs.oxide.computer` for the actual link URLs stored in code, since the preview content will be live there once published.

For detailed section anchors on a specific page, fetch the page directly and inspect headings. For example:

```
https://docs-git-v<VERSION>-oxidecomputer.vercel.app/guides/configuring-guest-networking
```

### 2. Check the OpenAPI schema for context (optional)

The OpenAPI spec at `https://github.com/oxidecomputer/omicron/blob/main/openapi/nexus.json` contains endpoint descriptions and type documentation that can inform help text. Use this when:

- You need to understand what an API field does
- The docs site doesn't cover a specific concept
- You want to verify terminology

The schema is large — fetch specific sections rather than the whole file. Use the GitHub raw URL with a path to the relevant section, or search for specific endpoint/type names.

### 3. Add link entries to `app/util/links.ts`

All documentation URLs live in the `links` object, and display-ready link configs live in the `docLinks` object.

**Pattern for `links`** (alphabetical order):

```typescript
export const links = {
  // ...
  routesDocs: 'https://docs.oxide.computer/guides/configuring-guest-networking#vpc-subnet',
  // ...
}
```

**Pattern for `docLinks`** (alphabetical order):

```typescript
export const docLinks = {
  // ...
  routes: {
    href: links.routesDocs,
    linkText: 'VPC Subnet Routing',
  },
  // ...
}
```

### 4. Add DocsPopover to page headers

Used on list pages and detail pages inside `<PageHeader>`.

**File**: `app/components/DocsPopover.tsx`

```tsx
import { DocsPopover } from '~/components/DocsPopover'
import { docLinks } from '~/util/links'

;<PageHeader>
  <PageTitle icon={<SomeIcon24 />}>Page Title</PageTitle>
  <DocsPopover
    heading="resource name" // lowercase — renders as "Learn about {heading}"
    icon={<SomeIcon16 />} // 16px icon variant
    summary="One-sentence description assuming competent users."
    links={[docLinks.someLink, docLinks.anotherLink]}
  />
</PageHeader>
```

### 5. Add ModalLinks to side modal forms

Used at the bottom of `SideModalForm` and `ReadOnlySideModalForm` content, after a `FormDivider`.

**File**: `app/ui/lib/ModalLinks.tsx`

```tsx
import { FormDivider } from '~/ui/lib/Divider'
import { ModalLink, ModalLinks } from '~/ui/lib/ModalLinks'
import { links } from '~/util/links'

// Inside the form, after form fields:
<FormDivider />
<ModalLinks heading="Relevant docs">
  <ModalLink to={links.somePageDocs} label="Human-Readable Label" />
  <ModalLink to={links.anotherPageDocs} label="Another Label" />
</ModalLinks>
```

Note: `ModalLink` uses `links.*` (raw URLs), not `docLinks.*` (which are `{href, linkText}` objects for DocsPopover).

### 6. Write good microcopy

Guidelines:

- **Assume competence.** Users know what VPCs, subnets, and firewalls are. Don't explain basic concepts.
- **Be concise.** One sentence for DocsPopover summaries. Short phrases for empty states and tooltips.
- **Spell out constraints and consequences**, not mechanics. "Gateways can only be modified through the CLI or API" is better than "For now, gateways can only be modified through the API."
- **Use consistent voice.** Imperative for actions ("Attach an IP pool"), declarative for descriptions ("Routers contain routes that control how traffic is forwarded").

### 7. Existing examples to reference

| Pattern                       | Example file                                             |
| ----------------------------- | -------------------------------------------------------- |
| DocsPopover on list page      | `app/pages/project/vpcs/VpcsPage.tsx` (`VpcDocsPopover`) |
| DocsPopover on detail page    | `app/pages/project/vpcs/RouterPage.tsx`                  |
| DocsPopover wrapper component | `app/components/InstanceDocsPopover.tsx`                 |
| ModalLinks in create form     | `app/forms/ip-pool-create.tsx`                           |
| ModalLinks in read-only modal | `app/pages/project/vpcs/internet-gateway-edit.tsx`       |
| LearnMore in CardBlock footer | `app/pages/project/instances/ConnectTab.tsx`             |

### 8. Verify changes

```bash
npm run lint
npm run tsc
npm run fmt
```
