import { FileInput } from './FileInput'

const props = { onChange: (file: File | null) => console.log('onChange', file) }

export const Default = () => <FileInput {...props} />

export const WithAccept = () => <FileInput accept=".doc,.docx,.tar.gz" {...props} />
