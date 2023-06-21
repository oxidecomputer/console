import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Error24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="24/error">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM7.44717 9.61349C7.15428 9.3206 7.15428 8.84572 7.44717 8.55283L8.33105 7.66895C8.62395 7.37605 9.09882 7.37605 9.39171 7.66895L11.7782 10.0555L14.1647 7.669C14.4576 7.3761 14.9325 7.3761 15.2253 7.669L16.1092 8.55288C16.4021 8.84577 16.4021 9.32065 16.1092 9.61354L13.7228 12L16.1092 14.3865C16.4021 14.6794 16.4021 15.1542 16.1092 15.4471L15.2253 16.331C14.9325 16.6239 14.4576 16.6239 14.1647 16.331L11.7782 13.9445L9.39171 16.3311C9.09882 16.6239 8.62395 16.6239 8.33105 16.3311L7.44717 15.4472C7.15428 15.1543 7.15428 14.6794 7.44717 14.3865L9.83368 12L7.44717 9.61349Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Error24Icon
