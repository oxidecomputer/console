import { Section } from '../../util/story-section'

export const Default = () => (
  <>
    <Section title="Mono" className="space-x-4">
      <span className="!text-mono-lg !ml-0">text-mono-lg</span>
      <span className="!text-mono-md">text-mono-md</span>
      <span className="!text-mono-sm">text-mono-sm</span>
      <span className="!text-mono-xs">text-mono-xs</span>
    </Section>

    <Section title="Sans" className="space-x-4">
      <span className="!ml-0 !text-sans-3xl">text-sans-3xl</span>
      <span className="!text-sans-2xl">text-sans-2xl</span>
      <span className="!text-sans-xl">text-sans-xl</span>
      <span className="!text-sans-lg">text-sans-lg</span>
      <span className="!text-sans-md">text-sans-md</span>
      <span className="!text-sans-sm">text-sans-sm</span>
    </Section>

    <Section title="Sans Medium" className="space-x-4">
      <span className="!ml-0 !text-sans-semi-lg">text-sans-semi-lg</span>
      <span className="!text-sans-semi-md">text-sans-semi-md</span>
      <span className="!text-sans-semi-sm">text-sans-semi-sm</span>
    </Section>
  </>
)
