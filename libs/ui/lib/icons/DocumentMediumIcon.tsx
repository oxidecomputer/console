import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function DocumentMediumIcon({
  title = 'Document',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        d="M11.5 0H2v16h12V2.545L11.5 0zM4 8h5v2H4V8zm6 5H4v-2h6v2zm1-5.91H4V5h7v2.09z"
        fill="#48D597"
      />
    </svg>
  )
}

export default DocumentMediumIcon
