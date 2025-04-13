declare module 'frappe-gantt';

//* Projects
export interface ProjectProps {
   id: string                            
   name: string
   description: string
   startDate: string                                  /* DD/MM/YYYY */
   endDate: string                                    /* DD/MM/YYYY */
   status: string                                     /* DEFAULT: "Activo" | "Inactivo" | "Finalizado" */
   createdAt: string                                  /* DD/MM/YYYY (T) HH:MM:SS */
   updatedAt: string                                  /* DD/MM/YYYY (T) HH:MM:SS */
   createdBy: string 
}

//* Tasks
export interface TaskProps {
   id: string 
   title: string
   description: string
   projectId: string 
   priority: string                                   /* DEFAULT: "Baja" | "Media" | "Alta" */
   status: string
   reporterId: string 
   assigneeId: string 
   createdAt: string                                  /* DD/MM/YYYY (T) HH:MM:SS  */
   updatedAt: string                                  /* DD/MM/YYYY (T) HH:MM:SS */
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
   firstName: string
   lastName: string
   googleId: string
   role: RoleProps
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

//* Notifications
export interface NotificationProps {
   id: string 
   message: string
   type: string
   wasReaded: boolean                                 //! read en NotificationDTO
   timestamp: string                                  /* DD/MM/YYYY (T) HH:MM:SS */
   metadata: NotificationMetadataProps
}

//* Notifications Metadata
export interface NotificationMetadataProps {
   issueId: string
   projectId: string
}