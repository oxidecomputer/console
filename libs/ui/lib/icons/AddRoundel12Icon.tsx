import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const AddRoundel12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="12/add-roundel">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 12C9.31371 12 12 9.3137 12 5.99999C12 2.68628 9.31371 -9.26154e-06 6 -9.09295e-06C2.68629 -9.26154e-06 3.67839e-08 2.68628 2.89665e-07 5.99999C3.73959e-07 9.3137 2.68629 12 6 12ZM6.083 2.5C6.45137 2.5 6.75 2.79863 6.75 3.167L6.75 5.25L8.833 5.25C9.20137 5.25 9.5 5.54863 9.5 5.917L9.5 6.083C9.5 6.45137 9.20137 6.75 8.833 6.75L6.75 6.75V8.833C6.75 9.20137 6.45137 9.5 6.083 9.5H5.917C5.54863 9.5 5.25 9.20137 5.25 8.833L5.25 6.75L3.167 6.75C2.79863 6.75 2.5 6.45137 2.5 6.083L2.5 5.917C2.5 5.54863 2.79863 5.25 3.167 5.25L5.25 5.25L5.25 3.167C5.25 2.79863 5.54863 2.5 5.917 2.5L6.083 2.5Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default AddRoundel12Icon
