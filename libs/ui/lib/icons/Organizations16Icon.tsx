import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Organizations16Icon({
  title = 'Organizations',
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
      <g fill="currentColor">
        <path d="M12.667 4.667L16 8l-3.333 3.334L9.333 8zM8 9.333l3.334 3.333L8 16l-3.333-3.334zM8 0l3.333 3.333L8 6.667 4.667 3.333zM3.333 4.667L6.666 8l-3.333 3.333L0 8z" />
      </g>
    </svg>
  )
}

export default Organizations16Icon
