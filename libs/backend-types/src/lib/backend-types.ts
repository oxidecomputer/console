export type ProjectId = string
export interface Project {
  id: ProjectId
  name: string
  notifications?: number
  starred?: boolean
}
