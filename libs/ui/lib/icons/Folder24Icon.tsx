import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Folder24Icon({
  title = 'Folder',
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1 3h13v3H1V3zm0 5h22v13H1V8z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Folder24Icon
