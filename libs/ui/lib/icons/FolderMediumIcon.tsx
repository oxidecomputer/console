import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function FolderMediumIcon({
  title = 'Folder',
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
        d="M1 2h8.273v1.91H1V2zm0 3h14v9H1V5z"
        fill="currentColor"
      />
    </svg>
  )
}

export default FolderMediumIcon
