import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function SelectArrowsMiscIcon({
  title = 'SelectArrows',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={6}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <g fill="#808789">
        <path d="M3 0l3 6H0l3-6zM3 16l-3-6h6l-3 6z" />
      </g>
    </svg>
  )
}

export default SelectArrowsMiscIcon
