import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Select10Icon({
  title = 'Select',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={10}
      height={10}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h10v2H0V0zm0 4h10v2H0V4zm10 4H0v2h10V8z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Select10Icon
