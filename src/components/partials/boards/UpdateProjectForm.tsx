import { ProjectProps } from "@/lib/types/types"
import CreateBoardForm from "./CreateBoardForm"

interface UpdateProjectFormProps {
   onSubmit: (data: ProjectProps, jiraImport: File | null) => void
   onCancel: () => void
   projectObject: ProjectProps
}

export default function UpdateProjectForm({ onSubmit, onCancel, projectObject }: UpdateProjectFormProps) {
   return (
      <CreateBoardForm
         onSubmit={onSubmit}
         onCancel={onCancel}
         editData={projectObject}
         isEdit={true}
      />
   )
}