import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Info8Icon({
  title = 'Info',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={8}
      height={12}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        d="M0 2a2 2 0 012-2h4a2 2 0 012 2v8a2 2 0 01-2 2H2a2 2 0 01-2-2V2z"
        fill="#102422"
      />
      <path
        d="M2.858 4.916a3.746 3.746 0 01-.045-.583c0-1.035.487-1.508 1.182-1.508.795 0 1.147.506 1.147 1.123 0 .704-.28 1.122-.605 1.463l-.46.473c-.497.518-.515.859-.515 1.167v.462h.768v-.198c0-.43.08-.704.37-1.001l.487-.496C5.612 5.39 6 4.74 6 3.948 6 2.759 5.368 2 3.995 2 2.74 2 2 2.891 2 4.223c0 .132.018.429.036.572l.822.121zm.533 3.675V10h1.2V8.591h-1.2z"
        fill="#2E8160"
      />
    </svg>
  )
}

export default Info8Icon
