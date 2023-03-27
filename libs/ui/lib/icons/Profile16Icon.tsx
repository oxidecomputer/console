import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Profile16Icon = ({
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
    <g id="16/profile">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 13.7453C13.8135 12.4804 15 10.3787 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 10.3787 2.18652 12.4804 4 13.7453C5.13383 14.5362 6.51275 15 8 15C9.48725 15 10.8662 14.5362 12 13.7453ZM4.12071 11.1548C4.48568 9.90945 5.63663 9 7 9H9C10.3634 9 11.5143 9.90945 11.8793 11.1548C10.9625 12.2808 9.56523 13 8 13C6.43477 13 5.03752 12.2808 4.12071 11.1548ZM10 6C10 7.10457 9.10457 8 8 8C6.89543 8 6 7.10457 6 6C6 4.89543 6.89543 4 8 4C9.10457 4 10 4.89543 10 6Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Profile16Icon
