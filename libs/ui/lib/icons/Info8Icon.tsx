import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Info8Icon({
  title = '',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={8}
      height={14}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        d="M0 1a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H1a1 1 0 01-1-1V1z"
        fill="currentColor"
      />
      <path
        d="M2.858 5.916a3.746 3.746 0 01-.045-.583c0-1.035.487-1.508 1.182-1.508.795 0 1.147.506 1.147 1.123 0 .704-.28 1.122-.605 1.463l-.46.473c-.497.518-.515.859-.515 1.167v.462h.768v-.198c0-.43.08-.704.37-1.001l.487-.496C5.612 6.39 6 5.74 6 4.948 6 3.759 5.368 3 3.995 3 2.74 3 2 3.891 2 5.223c0 .132.018.429.036.572l.822.121zm.533 3.675V11h1.2V9.591h-1.2z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Info8Icon
