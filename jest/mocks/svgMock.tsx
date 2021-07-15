import React from 'react'

export default 'svg-file-stub'
export const ReactComponent: React.FC<
  React.SVGProps<SVGSVGElement> & { title: string }
> = ({ title }) => <div>Icon: {title}</div>
