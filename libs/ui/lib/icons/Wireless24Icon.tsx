import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Wireless24Icon({
  title = '',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={24}
      height={24}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        d="M12.047 20L22 9.6C19.84 6.2 16.178 4 12.047 4 7.915 4 4.16 6.2 2 9.6L12.047 20z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Wireless24Icon
