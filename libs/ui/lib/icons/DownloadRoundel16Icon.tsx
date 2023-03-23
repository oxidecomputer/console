import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const DownloadRoundel16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/download-roundel">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM4.90532 8L7 8L7 4.75C7 4.33579 7.33579 4 7.75 4H8.25C8.66421 4 9 4.33579 9 4.75L9 8H11.0947C11.4288 8 11.5961 8.40393 11.3598 8.64017L8.53033 11.4697C8.23743 11.7626 7.76256 11.7626 7.46967 11.4697L4.64016 8.64016C4.40392 8.40393 4.57123 8 4.90532 8Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default DownloadRoundel16Icon
