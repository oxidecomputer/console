export interface Schema {
  name: string
  skipStories?: boolean
  storyType?: 'mdx' | 'csf'
  export?: boolean
  directory?: string
}
