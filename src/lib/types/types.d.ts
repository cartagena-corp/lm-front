declare module 'frappe-gantt'

//* Projects
export interface ProjectProps {
   id: string
   name: string
   description: string
   startDate: string
   endDate: string
   status: ConfigProjectStatusProps | number
   createdAt: string
   updatedAt: string
   createdBy?: {
      id: string,
      firstName: string,
      lastName: string,
      picture: string
   }
}

//* Tasks
export interface TaskProps {
   id?: string
   title: string
   descriptions: {
      id?: string
      title: string
      text: string
   }[]
   projectId: string
   priority: number                                   /* DEFAULT: "Baja" | "Media" | "Alta" */
   status: number
   assignedId: {
      id: string,
      firstName: string,
      lastName: string,
      picture: string
      email: string
   } | string
   reporterId?: {
      id: string,
      firstName: string,
      lastName: string,
      picture: string
   }
   createdAt?: string                                  /* DD/MM/YYYY (T) HH:MM:SS  */
   updatedAt?: string                                  /* DD/MM/YYYY (T) HH:MM:SS */
   type: number
   estimatedTime: number
   sprintId?: string
}

//* Comments
export interface CommentProps {
   id: string
   issueId: string
   userId: string
   text: string
   createdAt: string                                  /* DD/MM/YYYY (T) HH:MM:SS */
   attachments: FileAttachmentProps[]
}

//* File Attachment
export interface FileAttachmentProps {
   id: string
   fileName: string
   fileUrl: string
   commentId: string
}

//* Users
export interface UserProps {
   id: string
   email: string
   firstName?: string
   lastName?: string
   role?: RoleProps | string
   picture: string
}

//* Roles
export interface RoleProps {
   name: string
   permissions: PermissionProps[]
}

//* Permissions
export interface PermissionProps {
   name: string
}



//* Notifications Metadata
export interface IconProps {
   size?: number | string
   stroke?: number
}

//* Configuration
export interface ConfigProjectStatusProps {
   id: number
   name: string
   color: string
   orderIndex?: number
}

//* Project Filters
export interface FilterProjectProps {
   name: string
   status: number
   createdBy: string
   page: number
   size: number
   sortBy: { id: string, sort: string }
   direction: string
}

//* Tasks Filters
export interface FilterTaskProps {
   keyword: string
   projectId: string
   sprintId: string
   priority: string
   type: string
   status: string
   assignedId: string
   sortBy: string
   direction: string
   page: number
   size: number
}

//* Project Config
export interface ProjectConfigProps {
   id: number,
   projectId: string,
   issueStatuses: {
      id: number,
      name: string,
      color: string
   }[],
   issuePriorities: {
      id: number,
      name: string,
      color: string
   }[],
   issueTypes: {
      id: number,
      name: string,
      color: string
   }[],
   issueDescriptions: {
      id: number,
      name: string,
      color: string
   }[],
   sprintStatuses: {
      id: number,
      name: string,
      color: string
   }[],
}

//* Sprints Props
export interface SprintProps {
   id?: string
   projectId: string
   title: string
   goal: string
   statusObject?: ConfigProjectStatusProps
   status?: number
   startDate: string
   endDate: string
   active?: boolean
   tasks?: {
      content: TaskProps[]
      totalPages: number
      totalElements: number
      size: number
      number: number
   }
}

//* Comments Props
export interface CommentProps {
   id: string
   issueId: string
   userId: string
   text: string
   createdAt: string
   attachments: null | {
      id: string
      fileName: string
      fileUrl: string
      commentId: string
   }
   user: UserProps
   responsesCount: number
}

//* Responses Props
export interface ResponseProps {
   id: string
   commentId: string
   userId: string
   text: string
   createdAt: string
   user: {
      id: string
      firstName: string
      lastName: string
      picture: string
   }
}

//* Notifications Props
export interface NotificationProps {
   id: string
   message: string
   type: string
   read: boolean,
   timestamp: string
   metadata: {
      projectId: string
      issueId: string
   } | null
   projectId: string
   issueId: string
}

//* WebSocket Notification Response
export interface WebSocketNotificationResponse {
   notification: NotificationProps
   unreadCount: number
}

//* GLOBAL GETTER PAGINATION
export interface GlobalPagination {
   content: [] | ProjectProps[] | TaskProps[] | SprintProps[] | CommentProps[]
   totalPages: number
   totalElements: number
   size: number
   number: number
}

//* Audit History
export interface AuditHistoryProps {
   id: string
   issueId: string
   userId: string
   action: string
   description: string
   timestamp: string
   projectId: string
}

//* Audit History Pagination
export interface AuditPagination {
   content: AuditHistoryProps[]
   totalPages: number
   totalElements: number
   size: number
   number: number
}