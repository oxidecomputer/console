import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Disabled12Icon({
  title = '',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={12}
      height={12}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 12A6 6 0 106 0a6 6 0 000 12zm3.536-5.293H2.464V5.293h7.072v1.414z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Disabled12Icon
