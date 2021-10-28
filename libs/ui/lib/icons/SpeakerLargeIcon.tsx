import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function SpeakerLargeIcon({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.372 7L21 0v24l-10.628-7H3V7h7.372z"
        fill="#48D597"
      />
    </svg>
  )
}

export default SpeakerLargeIcon
