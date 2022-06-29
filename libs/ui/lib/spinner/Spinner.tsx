import cn from 'classnames'

interface SpinnerProps {
  className?: string
}

export const Spinner = ({ className }: SpinnerProps) => {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="Spinner"
      className={cn('animate-spin', className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 10.5C8.48528 10.5 10.5 8.48528 10.5 6C10.5 3.51472 8.48528 1.5 6 1.5C3.51472 1.5 1.5 3.51472 1.5 6C1.5 8.48528 3.51472 10.5 6 10.5ZM6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12Z"
        fill="currentColor"
        fillOpacity={0.5}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.2498 2.10277C7.56576 1.70789 6.78983 1.5 6 1.5V0C7.05311 0 8.08768 0.277182 8.99973 0.803691C9.91178 1.3302 10.6692 2.08749 11.1958 2.99946C11.7225 3.91142 11.9998 4.94594 12 5.99906C12.0002 7.05217 11.7231 8.08678 11.1968 8.99891L9.89758 8.24918C10.2924 7.56508 10.5001 6.78913 10.5 5.99929C10.4999 5.20946 10.2919 4.43357 9.89688 3.74959C9.50189 3.06562 8.93383 2.49765 8.2498 2.10277Z"
        fill="currentColor"
      />
    </svg>
  )
}
