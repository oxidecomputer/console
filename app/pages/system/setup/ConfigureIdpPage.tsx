import { Divider } from '@oxide/ui'

export function ConfigureIdpPage() {
  return (
    <>
      <header className="text-sans-3xl">Configure identity provider</header>
      <p className="content-secondary mt-3 text-sans-lg">
        The Oxide console can integrate with any SAML 2.0-compliant identity provider. End
        users will authenticate to the web console and using the IdP that you configure
        here. Users will be provisioned when they log in for the first time (&ldquo;JIT
        provisioning&rdquo;). If your IdP can include a list of the user&apos;s groups as a
        SAML attribute, configure that here. Groups will be provisioned the first time a
        user in that group logs in.
      </p>
      <Divider className="my-8" />
      <div className="flex flex-col gap-4">
        <div className="h-32 border border-secondary">Hi</div>
        <div className="h-32 border border-secondary">Hi</div>
        <div className="h-32 border border-secondary">Hi</div>
        <div className="h-32 border border-secondary">Hi</div>
        <div className="h-32 border border-secondary">Hi</div>
      </div>
    </>
  )
}
