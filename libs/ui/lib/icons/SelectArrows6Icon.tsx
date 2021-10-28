import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function SelectArrows6Icon({
  title = 'Select',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={6}
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
        d="M6 6L3 0 0 6h6zm-6 4l3 6 3-6H0z"
        fill="currentColor"
      />
    </svg>
  )
}

export default SelectArrows6Icon
