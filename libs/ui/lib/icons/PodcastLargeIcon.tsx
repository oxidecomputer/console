import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function PodcastLargeIcon({
  title = 'Podcast',
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
        d="M4.265 16.09l-1.362 1.25A11.986 11.986 0 010 9.5c0-3.26 1.296-6.218 3.4-8.383l1.363 1.249A10.148 10.148 0 001.846 9.5c0 2.514.91 4.815 2.42 6.59zM16.511 4.865l1.363-1.25A8.303 8.303 0 0120.308 9.5a8.297 8.297 0 01-1.936 5.34l-1.364-1.25a6.453 6.453 0 001.454-4.09c0-1.817-.748-3.46-1.951-4.635zM22.154 9.5c0-2.78-1.113-5.298-2.917-7.134l1.363-1.25A11.992 11.992 0 0124 9.5c0 2.995-1.094 5.735-2.903 7.84l-1.362-1.25a10.141 10.141 0 002.419-6.59zM5.628 14.84l1.364-1.25A6.453 6.453 0 015.538 9.5c0-1.817.748-3.46 1.951-4.635l-1.363-1.25A8.303 8.303 0 003.692 9.5c0 2.033.728 3.895 1.936 5.34zM16 9c0 1.67-1.023 3.1-2.477 3.7L17 24H7l3.477-11.3A4.001 4.001 0 1116 9z"
        fill="currentColor"
      />
    </svg>
  )
}

export default PodcastLargeIcon
