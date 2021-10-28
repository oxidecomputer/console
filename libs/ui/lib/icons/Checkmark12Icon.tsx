import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Checkmark12Icon({
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
        d="M11 3.09L4.979 10 1 6.043l1.182-1.176 2.71 2.694L9.736 2 11 3.09z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Checkmark12Icon
