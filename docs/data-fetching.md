# Console data fetching architecture

## Key elements

- oxide.ts generated API client
- [React Query](https://tanstack.com/query/v4/docs/overview) (RQ)
- Custom hooks that wrap RQ's `useQuery` and friends with API-specific types
- React Router loaders

## Background

I wish we didn't have anything called a "data fetching architecture," and for a while it felt like we didn't because all we had was our typed wrappers for React Query. Request data wherever it's needed (even from multiple spots on the same page) and let RQ use its cache to dedupe simultaneous requests (i.e., requests that happen within the defined `staleTime`, which for us is 2 seconds).

That's not a bad setup, and it's incredibly easy to understand — there's essentially no global app structure except for the request cache — but the fact that fetches are triggered by render (["fetch-on-render"](https://17.reactjs.org/docs/concurrent-mode-suspense.html#approach-1-fetch-on-render-not-using-suspense)) means you see a page skeleton first and then the data pops in when the request comes back, and it looks like amateur hour. We may be stuck fully client-side ("for now," I tell myself), but we certainly don't want the app to feel like it.

That's where React Router 6.4 comes in. It brings Remix's data fetching concepts and behavior to React Router. The idea is that rather than tying data fetching to rendering, you tag each route node with its data requirements so that

1. data can be be fetched in parallel rather than rendering the parent, waiting for the data to come back, then rendering the children, which triggers the children's data fetch (waterfall)
2. you can wait to render the component until after its data is already fetched, which means you never see the empty skeleton view.

2 is more important for us in my view because we don't often have multiple loaders running on the same page, or at least if we do (e.g., listing projects in the sidebar) our primary data fetching is pretty much always on the leaf route node representing the page's main content. What 2 buys us is that navigation feels like a server-rendered web app. When you click a link, the URL and what is displayed on the page don't change until the data requirements for the next page are satisfied, at which point the next page can be rendered all at once like server-rendered HTML. It may not sound like much, but it feels completely different.

## Example

All of these elements are used in nearly every data fetch on the site, so a single example should suffice to give the general idea.

1. `prefetchQuery('orgList', { limit: 10 })` in route loader

   This seeds the cache with the query result.

1. `useApiQuery('orgList', { limit: 10 })` in page component

   Without the prefetch in the loader, this would trigger the fetch, but because of the prefetch, this pulls the response from the RQ cache instantly.
