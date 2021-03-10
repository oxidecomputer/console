export type ProjectId = string
export interface Project {
  id: ProjectId
  name: string
  notificationsCount?: number
  starred?: boolean
}
