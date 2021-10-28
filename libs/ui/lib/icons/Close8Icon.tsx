import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Close8Icon({
  title = 'Close',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={8}
      height={8}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 4.707l2.475 2.475.707-.707L4.707 4l2.475-2.475-.707-.707L4 3.293 1.525.818l-.707.707L3.293 4 .818 6.475l.707.707L4 4.707z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Close8Icon
