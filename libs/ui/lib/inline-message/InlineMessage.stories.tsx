import { InlineMessage } from './InlineMessage'

export const Default = () => (
  <InlineMessage
    variant="notice"
    content={
      <>
        If your image supports the <a href="/">cidata volume</a> cloud-init the following
        keys will be added to your instance. Keys are added when the instance is created and
        are not updated after instance launch.
      </>
    }
    cta={{
      text: 'Learn more about SSH keys',
      link: '/',
    }}
  />
)
