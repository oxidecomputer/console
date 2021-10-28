import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function UbuntuDistroIcon({
  title = 'Ubuntu',
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
        d="M8 15A7 7 0 108 1a7 7 0 000 14zM3.467 8.9a.9.9 0 100-1.8.9.9 0 000 1.8zm7.25 3.805a.9.9 0 11-.9-1.56.9.9 0 01.9 1.56zm0-9.41a.9.9 0 11-.899 1.558.9.9 0 01.899-1.558zm-.16 4.478a2.566 2.566 0 00-3.638-2.101l-.634-1.138a3.87 3.87 0 012.73-.265 1.264 1.264 0 001.708.986 3.855 3.855 0 011.136 2.497l-1.302.02zM6.525 5.9a2.564 2.564 0 000 4.2l-.669 1.118a3.874 3.874 0 01-1.595-2.231 1.264 1.264 0 000-1.974 3.873 3.873 0 011.595-2.231L6.525 5.9zm.394 4.428a2.566 2.566 0 003.638-2.1l1.302.02a3.856 3.856 0 01-1.136 2.497 1.264 1.264 0 00-1.707.987 3.866 3.866 0 01-2.731-.266l.634-1.138z"
        fill="currentColor"
      />
    </svg>
  )
}

export default UbuntuDistroIcon
