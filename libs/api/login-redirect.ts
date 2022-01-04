// this is only a separate module so we can easily mock it in tests. jsdom
// doesn't support navigation

export function redirectToLogin(
  opts: { includeCurrent: boolean } = { includeCurrent: false }
) {
  const url = opts.includeCurrent
    ? // TODO: include query args too?
      `/login?state=${encodeURIComponent(window.location.pathname)}`
    : '/login'
  window.location.assign(url)
}
