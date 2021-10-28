import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function OpenLinkSmallIcon({
  title = 'OpenLink',
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
        d="M2 1h3.02l.99.99.01.01H2v8h8V5.98l.01.01.99.99V11H1V1h1zm8 3L8 2 7 1h4v4l-1-1z"
        fill="currentColor"
      />
    </svg>
  )
}

export default OpenLinkSmallIcon
