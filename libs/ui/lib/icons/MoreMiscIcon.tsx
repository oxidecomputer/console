import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function MoreMiscIcon({
  title = 'More',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={15}
      height={16}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 0h3v4H6V0zm0 6h3v4H6V6zm3 6H6v4h3v-4z"
        fill="currentColor"
      />
    </svg>
  )
}

export default MoreMiscIcon
