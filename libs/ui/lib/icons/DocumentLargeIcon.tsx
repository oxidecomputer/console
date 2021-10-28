import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function DocumentLargeIcon({
  title = 'Document',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        d="M16 1H4v22h16V5l-4-4zM6 11h9v2H6v-2zm11 6H6v-2h11v2zm1-8H6V7h12v2z"
        fill="#48D597"
      />
    </svg>
  )
}

export default DocumentLargeIcon
