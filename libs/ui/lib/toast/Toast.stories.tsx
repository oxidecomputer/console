import { Toast } from './Toast'

export const Default = () => (
  <Toast
    variant="success"
    content="7 members have been added"
    onClose={() => alert('onClose')}
    cta={{
      text: 'Learn more',
      link: '/',
    }}
  />
)
