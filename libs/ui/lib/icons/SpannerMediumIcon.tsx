import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function SpannerMediumIcon({
  title = 'Spanner',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={16}
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
        d="M6.703 9.703A5 5 0 01.298 3.298L4 7l3-3L3.297.297a5 5 0 016.405 6.405L16 13l-3 3-6.297-6.297z"
        fill="currentColor"
      />
    </svg>
  )
}

export default SpannerMediumIcon
