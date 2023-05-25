import { Divider } from '@oxide/ui'

export function CreateSiloPage() {
  return (
    <>
      <header className="text-sans-3xl">Create a silo</header>
      <p className="content-secondary mt-3 text-sans-lg">
        A silo is our top-level container used to provision resources in the Oxide rack. It
        holds the details of all your resources including Projects, Instances, Disks,
        Snapshots, etc. Identities for users, groups, and service accounts are always scoped
        to a single silo.
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
