import React from 'react'

import styled from 'styled-components'

/*
Sizes:
64px
56px
48px
40px
32px
24px

*/

export const sizes = {
  '2xl': '64px',
  xl: '56px',
  lg: '48px',
  base: '40px',
  sm: '32px',
  xs: '24px',
}

export interface AvatarProps {
  /**
   * Name of person or org
   */
  name: string
  /**
   * Override the default size of image
   */
  size?: keyof typeof sizes
  /**
   * The url for the image (`<img>`) tag to use
   * */
  src?: 'string'
}

const Wrapper = styled.div<Omit<AvatarProps, 'name'>>`
  height: ${(props) => sizes[props.size]};
  width: ${(props) => sizes[props.size]};

  background-color: pink;
`

export const Avatar: React.FC<AvatarProps> = ({ name, src, size }) => {
  if (src) {
    return (
      <Wrapper size={size}>
        <img src={src} alt={name} />
      </Wrapper>
    )
  }
  const firstLetters = name.slice(0, 2)
  return <Wrapper size={size}>{firstLetters}</Wrapper>
}

Avatar.defaultProps = {
  size: 'base',
}

export default Avatar
